//
// main.js
//
(function() {
  // -----------------------------
  // 1. DOM REFERENCES
  // -----------------------------
  const dropdownToggle   = document.querySelector('.phone-dropdown-toggle');
  const dropdownContent  = document.querySelector('.phone-dropdown-content');
  const searchInput      = document.querySelector('.phone-dropdown-search');
  const dropdownList     = document.querySelector('.phone-dropdown-list');
  const hiddenISOInput   = document.querySelector('.iso-code-input');
  
  // Spinner + real country elements in the button
  const spinnerEl        = document.querySelector('.spinner');
  const selectedFlagEl   = document.querySelector('.selected-flag');
  const selectedPrefixEl = document.querySelector('.selected-prefix');

  let allCountries        = [];
  let filteredCountries   = [];
  let phoneOptionElements = [];
  let focusedIndex        = -1;

  // -----------------------------
  // 2. FETCH FUNCTIONS
  // -----------------------------
  async function fetchCountries() {
    const response = await fetch('https://restcountries.com/v3.1/all');
    if (!response.ok) {
      throw new Error('Error fetching countries');
    }
    return response.json();
  }

  async function fetchUserLocation() {
    // e.g. "country_code": "CH"
    try {
      const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
      if (response.ok) {
        return response.json();
      }
    } catch (err) {
      console.error('GeoJS error:', err);
    }
    return null;
  }

  function getPhonePrefix(country) {
    if (!country.idd || !country.idd.root) return '';
    const suffix = country.idd.suffixes?.[0] || '';
    return country.idd.root + suffix; 
  }

  // -----------------------------
  // 3. SEARCH LABEL BUILDER
  // -----------------------------
  function buildSearchLabel(country, prefix) {
    // 1) English (common) name
    const commonName = country.name?.common ?? '';
  
    // 2) Native names (if any)
    let nativeNamesText = '';
    if (country.name?.nativeName) {
      const nativeNameValues = Object.values(country.name.nativeName); 
      // e.g. for Switzerland, we get multiple languages
      //   { official: "Confédération suisse", common: "Suisse" }
      //   { official: "Schweizerische Eidgenossenschaft", common: "Schweiz" }
      //   etc...
      nativeNamesText = nativeNameValues
        .map(n => `${n.official ?? ''} ${n.common ?? ''}`)
        .join(' ');
    }
  
    // 3) Alt spellings
    const altSpellings = country.altSpellings || [];
  
    // 4) ISO codes
    const iso2 = country.cca2 ?? '';
    const iso3 = country.cca3 ?? '';
  
    // 5) All translations
    let translationsText = '';
    if (country.translations) {
      const translationValues = Object.values(country.translations);
      // e.g. "Suisse", "Schweiz", "Svizzera", ...
      translationsText = translationValues
        .map(t => `${t.official ?? ''} ${t.common ?? ''}`)
        .join(' ');
    }
  
    // 6) The phone prefix
    //    For "South Georgia" => +500 
    //    For "Switzerland" => +41 
    //    etc...
    // 'prefix' is computed from country.idd (root + suffix).
    
    // Finally combine them all
    return [
      iso2,
      iso3,
      commonName, 
      nativeNamesText,
      prefix, 
      ...altSpellings,
      translationsText
    ].join(' ');
  }

  // -----------------------------
  // 4. RENDER & EVENT HANDLERS
  // -----------------------------
  function renderDropdownOptions(countries) {
    dropdownList.innerHTML = '';

    countries.forEach(country => {
      const isoCode = country.cca2 || '';
      const prefix  = getPhonePrefix(country);
      if (!prefix) return;

      const countryName = country.name?.common || 'Unknown';
      // Prefer SVG, fallback to PNG
      const flagUrl = country.flags?.svg || country.flags?.png || '';

      const li = document.createElement('li');
      li.classList.add('phone-option');
      li.setAttribute('role', 'option');
      li.id = `phone-option-${isoCode.toLowerCase()}`;

      // Build the big search label
      const searchLabel = buildSearchLabel(country, prefix).toLowerCase();
      li.dataset.searchLabel = searchLabel;
      li.dataset.countryCode = isoCode;

      li.innerHTML = `
        <img class="flag" src="${flagUrl}" alt="${countryName} flag" width="24" height="18" />
        <span class="option-label">${prefix} ${countryName}</span>
      `;

      li.addEventListener('click', () => {
        selectedFlagEl.src = flagUrl;
        selectedPrefixEl.textContent = prefix;
        hiddenISOInput.value = isoCode;
        toggleDropdown(false);
        dropdownToggle.focus();
      });

      dropdownList.appendChild(li);
    });

    phoneOptionElements = Array.from(dropdownList.querySelectorAll('.phone-option'));
  }

  function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
      filteredCountries = allCountries.slice();
    } else {
      filteredCountries = allCountries.filter(country => {
        const prefix = getPhonePrefix(country).toLowerCase();
        // Build label
        const label = buildSearchLabel(country, prefix).toLowerCase();
        return label.includes(query);
      });
    }
    renderDropdownOptions(filteredCountries);
    focusedIndex = -1;
  }
  
  // Simple toggle for the dropdown
  function toggleDropdown(open) {
    if (open) {
      dropdownContent.style.display = 'block';
      dropdownToggle.setAttribute('aria-expanded', 'true');
      dropdownList.focus();
    } else {
      dropdownContent.style.display = 'none';
      dropdownToggle.setAttribute('aria-expanded', 'false');
    }
  }

  // Keyboard focus helpers
  function updateCurrentOption(newIndex) {
    phoneOptionElements.forEach(el => el.classList.remove('Current'));
    if (newIndex >= 0 && phoneOptionElements[newIndex]) {
      phoneOptionElements[newIndex].classList.add('Current');
    }
  }

  function focusOption(index) {
    if (index < 0 || index >= phoneOptionElements.length) return;
    focusedIndex = index;
    updateCurrentOption(index);
    phoneOptionElements[index].scrollIntoView({ block: 'nearest' });
    dropdownList.setAttribute('aria-activedescendant', phoneOptionElements[index].id);
  }

  function findNextMatch(char, startIndex) {
    const lowerChar = char.toLowerCase();
    for (let i = 0; i < phoneOptionElements.length; i++) {
      const idx = (startIndex + 1 + i) % phoneOptionElements.length;
      const label = phoneOptionElements[idx].dataset.searchLabel || '';
      if (label.startsWith(lowerChar)) {
        return idx;
      }
    }
    return -1;
  }

  // -----------------------------
  // 5. INIT
  // -----------------------------
  async function initDropdown() {
    try {
      // Spinner in button is visible; flag/prefix hidden
      // 1) Fetch countries
      allCountries = await fetchCountries();
      // 2) Sort
      allCountries.sort((a, b) => {
        const nameA = a.name?.common || '';
        const nameB = b.name?.common || '';
        return nameA.localeCompare(nameB);
      });
      filteredCountries = allCountries.slice();
      renderDropdownOptions(filteredCountries);

      // 3) IP-based country code
      const userLoc = await fetchUserLocation(); 
      let userCountryCode = null;
      if (userLoc && userLoc.country_code) {
        userCountryCode = userLoc.country_code;
        // console.log('[DEBUG] userCountryCode =', userCountryCode);
      }

      // Try to select user’s country
      if (userCountryCode) {
        const lowerCode = userCountryCode.toLowerCase();
        const matchIndex = phoneOptionElements.findIndex(
          el => el.dataset.countryCode.toLowerCase() === lowerCode
        );
        if (matchIndex > -1) {
          phoneOptionElements[matchIndex].click();
        }
      }

      // Data is ready => hide spinner, show real flag & prefix
      spinnerEl.style.display = 'none';
      selectedFlagEl.style.display = 'inline-block';
      selectedPrefixEl.style.display = 'inline-block';

    } catch (err) {
      console.error('initDropdown error:', err);
      spinnerEl.textContent = 'Failed to load data.';
    }
  }


  async function initDropdown() {
    try {
      // 1) Fetch countries
      allCountries = await fetchCountries();
      allCountries.sort((a, b) => {
        const nameA = a.name?.common || '';
        const nameB = b.name?.common || '';
        return nameA.localeCompare(nameB);
      });
      filteredCountries = allCountries.slice();
      renderDropdownOptions(filteredCountries);
      // 2) Attempt geo-IP
      try {
        const userLoc = await fetchUserLocation(); 
        // if userLoc fails, we don't kill the entire flow
        if (userLoc?.country_code) {
          // do the selection
        }
      } catch (locErr) {
        console.warn('fetchUserLocation failed', locErr);
      }
  
      // 3) Hide spinner, show UI
      spinnerEl.style.display = 'none';
      selectedFlagEl.style.display = 'inline-block';
      selectedPrefixEl.style.display = 'inline-block';
  
    } catch (err) {
      console.error('initDropdown error:', err);
      spinnerEl.textContent = 'Failed to load data.';
    }
  }
  

  // -----------------------------
  // 6. EVENT LISTENERS
  // -----------------------------
  // Button toggles dropdown
  dropdownToggle.addEventListener('click', () => {
    const isOpen = dropdownContent.style.display === 'block';
    toggleDropdown(!isOpen);
    if (!isOpen) {
      // Focus the "Current" or first
      const currentIndex = phoneOptionElements.findIndex(el => el.classList.contains('Current'));
      focusOption(currentIndex >= 0 ? currentIndex : 0);
    }
  });

  // If user types in the search input
  searchInput.addEventListener('input', handleSearch);

  // Keyboard navigation in the UL
  dropdownList.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusOption((focusedIndex + 1) % phoneOptionElements.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusOption((focusedIndex - 1 + phoneOptionElements.length) % phoneOptionElements.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          phoneOptionElements[focusedIndex].click();
        }
        break;
      case 'Escape':
        toggleDropdown(false);
        dropdownToggle.focus();
        break;
      default:
        // Jump by letter
        if (e.key.length === 1 && /[A-Za-z]/.test(e.key)) {
          e.preventDefault();
          const nextIndex = findNextMatch(e.key, focusedIndex);
          if (nextIndex >= 0) {
            focusOption(nextIndex);
          }
        }
    }
  });

  // Close if clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.phone-prefix-dropdown')) {
      toggleDropdown(false);
    }
  });

  // -----------------------------
  // 7. START
  // -----------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initDropdown();
  });
  
})();
