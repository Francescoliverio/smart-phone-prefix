(function () {

  // -----------------------------
  // CONFIGURATION
  // -----------------------------
  const DEFAULT_COUNTRY_CODE = 'ch'; // Default country code (e.g., Switzerland)
  const DEFAULT_COUNTRY_TIMEZONE = 'UTC+01:00'; // Default country timezone
  const TOP_COUNTRIES = ['ch', 'gb', 'it']; // List of top countries to display at the top
  const SHOW_TOP_COUNTRIES = false; // Toggle to show or hide top countries  
  // -----------------------------
  // 1. DOM REFERENCES
  // -----------------------------
  const dropdownToggle = document.querySelector('.phone-dropdown-toggle');
  const dropdownContent = document.querySelector('.phone-dropdown-content');
  const searchInput = document.querySelector('.phone-dropdown-search');
  const dropdownList = document.querySelector('.phone-dropdown-list');
  const hiddenPrefixInput = document.querySelector('.phone-prefix-input');
  const hiddenCountryISOCodeInput = document.querySelector('.country-iso-code-input');
  const hiddenTimezoneInput = document.querySelector('.country-timezone-input');

  const spinnerEl = document.querySelector('.spinner');
  const selectedFlagEl = document.querySelector('.selected-flag');
  const selectedPrefixEl = document.querySelector('.selected-prefix');
  const dropdownArrow = document.querySelector('.dropdown-arrow');

  let allCountries = [];
  let filteredCountries = [];
  let phoneOptionElements = [];
  let focusedIndex = -1;

  // -----------------------------
  // 2. FETCH FUNCTIONS
  // -----------------------------
  async function fetchCountries() {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all');
      if (!response.ok) {
        throw new Error(`Remote fetch failed: ${response.status}`);
      }
      return response.json();
    } catch (err) {
      console.warn('Using local fallback:', err);
      const localData = await fetch('./data/countries.json');
      return await localData.json();
    }
  }

  async function fetchUserLocation() {
    const services = [
      'https://get.geojs.io/v1/ip/geo.json',
      'https://ipapi.co/json/',
      'https://ipwhois.app/json/',
    ];
  
    for (let i = 0; i < services.length; i++) {
      try {
        const response = await fetch(services[i]);
        if (response.ok) {
          const data = await response.json();
  
          // Ensure the service provides timezone information
          if (data.timezone) {
            return {
              country_code: data.country_code || DEFAULT_COUNTRY_CODE,
              timezone: data.timezone || DEFAULT_COUNTRY_TIMEZONE,
            };
          }
        } else {
          console.warn(`Service ${services[i]} failed: ${response.status}`);
        }
      } catch (err) {
        console.error(`Error with service ${services[i]}:`, err);
      }
    }
  
    // Fallback if all services fail
    console.warn('All GeoIP services failed. Falling back to default location and timezone.');
    return {
      country_code: DEFAULT_COUNTRY_CODE,
      timezone: DEFAULT_COUNTRY_TIMEZONE,
    };
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
    const commonName = country.name?.common ?? '';
    let nativeNamesText = '';
    if (country.name?.nativeName) {
      const nativeNameValues = Object.values(country.name.nativeName);
      nativeNamesText = nativeNameValues
        .map((n) => `${n.official ?? ''} ${n.common ?? ''}`)
        .join(' ');
    }

    const altSpellings = country.altSpellings || [];
    const iso2 = country.cca2 ?? '';
    const iso3 = country.cca3 ?? '';

    let translationsText = '';
    if (country.translations) {
      const translationValues = Object.values(country.translations);
      translationsText = translationValues
        .map((t) => `${t.official ?? ''} ${t.common ?? ''}`)
        .join(' ');
    }

    return [
      iso2,
      iso3,
      commonName,
      nativeNamesText,
      prefix,
      ...altSpellings,
      translationsText,
    ].join(' ');
  }

  // -----------------------------
  // 4. REUSABLE ARROW NAVIGATION FUNCTION
  // -----------------------------
  function handleArrowNavigation(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (focusedIndex === -1 && phoneOptionElements.length > 0) {
          // Focus the first option if none is focused yet
          focusOption(0);
        } else {
          // Move to the next option
          focusOption((focusedIndex + 1) % phoneOptionElements.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (focusedIndex === -1 && phoneOptionElements.length > 0) {
          // Focus the last option if none is focused yet
          focusOption(phoneOptionElements.length - 1);
        } else {
          // Move to the previous option
          focusOption((focusedIndex - 1 + phoneOptionElements.length) % phoneOptionElements.length);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          // Select the currently focused option
          phoneOptionElements[focusedIndex].click();
        }
        break;
      default:
        // Allow normal behavior for other keys
        break;
    }
  }

  // -----------------------------
  // 5. RENDER & EVENT HANDLERS
  // -----------------------------

  function renderDropdownOptions(countries) {
    dropdownList.innerHTML = '';
  
    let topCountries = [];
    let remainingCountries = [];
  
    if (SHOW_TOP_COUNTRIES) {
      // Filter top countries for separate rendering
      topCountries = TOP_COUNTRIES.map((code) =>
        countries.find((country) => country.cca2.toLowerCase() === code.toLowerCase())
      ).filter(Boolean); // Remove undefined values if a code is not found

      remainingCountries = countries.filter(
        (country) => !TOP_COUNTRIES.includes(country.cca2.toLowerCase())
      );
  
      // Render top countries separately with a separator
      renderCountryList(topCountries);
  
      // Add a line separator
      if (topCountries.length > 0 && remainingCountries.length > 0) {
        const lineSeparator = document.createElement('li');
        lineSeparator.classList.add('line-separator');
        dropdownList.appendChild(lineSeparator);
      }
    } else {
      // If not showing top countries, treat them as part of the remaining list
      remainingCountries = countries;
    }
  
    // Render remaining countries (including top countries if SHOW_TOP_COUNTRIES is false)
    renderCountryList(remainingCountries);
  
    phoneOptionElements = Array.from(
      dropdownList.querySelectorAll('.phone-option')
    );
  }  
  

  function renderCountryList(countries) {
  
    countries.forEach((country) => {
      const isoCode = country.cca2 || '';
      const prefix = getPhonePrefix(country);
      if (!prefix) return;
  
      const flagUrl = country.flags?.svg || country.flags?.png || '';
  
      const li = document.createElement('li');
      li.classList.add('phone-option');
      li.setAttribute('role', 'option');
      li.id = `phone-option-${isoCode.toLowerCase()}`;
      li.dataset.searchLabel = `${prefix} ${isoCode}`.toLowerCase();
      li.dataset.countryCode = isoCode;
  
      li.innerHTML = `
        <img class="flag" src="${flagUrl}" alt="${isoCode} flag" width="24" height="18" />
        <span class="option-label">${prefix} ${isoCode}</span>
      `;
  
      li.addEventListener('click', async () => {
        selectedFlagEl.src = flagUrl;
        selectedPrefixEl.textContent = prefix + ' ' + isoCode;
        hiddenPrefixInput.value = prefix;
        hiddenCountryISOCodeInput.value = isoCode;
  
        await handleCountrySelection(isoCode);
  
        focusedIndex = phoneOptionElements.indexOf(li);
        toggleDropdown(false);
        dropdownToggle.focus();
      });
  
      dropdownList.appendChild(li);
    });
  }
  

  function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    filteredCountries = query
      ? allCountries.filter((country) => {
          const prefix = getPhonePrefix(country).toLowerCase();
          const label = buildSearchLabel(country, prefix).toLowerCase();
          return label.includes(query);
        })
      : allCountries.slice();
    renderDropdownOptions(filteredCountries);
    focusedIndex = -1;
  }

  function focusOption(index) {
    if (phoneOptionElements.length === 0) return;
  
    // Clear previous focus
    phoneOptionElements.forEach((el) => el.classList.remove('focused'));
  
    // Update the focused index
    focusedIndex = index;
  
    // Apply the focused class to the new element
    const focusedElement = phoneOptionElements[focusedIndex];
    focusedElement.classList.add('focused');
  
    // Scroll the focused option into view
    focusedElement.scrollIntoView({ block: 'nearest' });
  }
  
  function toggleDropdown(open) {
    if (open) {
      dropdownContent.style.display = 'block';
      dropdownToggle.setAttribute('aria-expanded', 'true');
      dropdownArrow.textContent = '▲';
      dropdownList.focus();

      // Scroll to the currently selected country
      if (focusedIndex >= 0) {
        focusOption(focusedIndex);
      }
    } else {
      dropdownContent.style.display = 'none';
      dropdownToggle.setAttribute('aria-expanded', 'false');
      dropdownArrow.textContent = '▼';
    }
  }

  async function handleCountrySelection(countryCode) {
    const selectedCountry = allCountries.find(
      (country) => country.cca2.toLowerCase() === countryCode.toLowerCase()
    );

    if (!selectedCountry) {
      console.error(`Country with code ${countryCode} not found.`);
      return;
    }

    // Update the hidden timezone input
    hiddenTimezoneInput.value = selectedCountry.timezones?.[0] || DEFAULT_COUNTRY_TIMEZONE;
  }
  

  async function initDropdown() {
    try {
      allCountries = await fetchCountries();

      allCountries.sort((a, b) => {
        const nameA = a.name?.common?.toLowerCase() || '';
        const nameB = b.name?.common?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });

      renderDropdownOptions(allCountries);

      const userLoc = await fetchUserLocation();
      const userCountryCode = userLoc?.country_code?.toLowerCase() || DEFAULT_COUNTRY_CODE;

      // Preselect user location country
      const matchIndex = phoneOptionElements.findIndex(
        (el) => el.dataset.countryCode.toLowerCase() === userCountryCode
      );

      if (matchIndex >= 0) {
        phoneOptionElements[matchIndex].click();
        focusOption(matchIndex); // Focus and scroll to the preselected country
      }

      spinnerEl.style.display = 'none';
      selectedFlagEl.style.display = 'inline-block';
      selectedPrefixEl.style.display = 'inline-block';
    } catch (err) {
      console.error('initDropdown error:', err);
      spinnerEl.textContent = 'Failed to load data.';
    }
  }

  dropdownToggle.addEventListener('click', () => {
    const isOpen = dropdownContent.style.display === 'block';
    toggleDropdown(!isOpen);
  });

  dropdownList.addEventListener('keydown', handleArrowNavigation);

  searchInput.addEventListener('keydown', (e) => {
    // Redirect arrow keys to dropdown navigation
    if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
      handleArrowNavigation(e);
    }
  });

  searchInput.addEventListener('input', handleSearch);

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.phone-prefix-dropdown')) {
      toggleDropdown(false);
    }
  });

  initDropdown();
})();