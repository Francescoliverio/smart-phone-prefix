//
// main.js
//
(function () {
  // -----------------------------
  // 1. DOM REFERENCES
  // -----------------------------
  const dropdownToggle = document.querySelector('.phone-dropdown-toggle');
  const dropdownContent = document.querySelector('.phone-dropdown-content');
  const searchInput = document.querySelector('.phone-dropdown-search');
  const dropdownList = document.querySelector('.phone-dropdown-list');
  const hiddenISOInput = document.querySelector('.iso-code-input');

  // Spinner + real country elements in the button
  const spinnerEl = document.querySelector('.spinner');
  const selectedFlagEl = document.querySelector('.selected-flag');
  const selectedPrefixEl = document.querySelector('.selected-prefix');

  let allCountries = [];
  let filteredCountries = [];
  let phoneOptionElements = [];
  let focusedIndex = -1;

  // -----------------------------
  // 2. FETCH FUNCTIONS
  // -----------------------------
  async function fetchCountries() {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all1');
      if (!response.ok) {
        throw new Error(`Remote fetch failed: ${response.status}`);
      }
      return response.json();
    } catch (err) {
      console.warn('Using local fallback:', err);
      // Use local fallback
      const localData = await fetch('./data/countries.json');
      console.log(localData);
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
          return response.json();
        } else {
          console.warn(`Service ${services[i]} failed: ${response.status}`);
        }
      } catch (err) {
        console.error(`Error with service ${services[i]}:`, err);
      }
    }

    // Fallback: Default to Switzerland
    console.warn('All GeoIP services failed. Defaulting to Switzerland.');
    return {
      country_code: 'CH',
      country_name: 'Switzerland',
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
  // 4. RENDER & EVENT HANDLERS
  // -----------------------------
  function renderDropdownOptions(countries) {
    dropdownList.innerHTML = '';

    countries.forEach((country) => {
      const isoCode = country.cca2 || '';
      const prefix = getPhonePrefix(country);
      if (!prefix) return;

      const countryName = country.name?.common || 'Unknown';
      const flagUrl = country.flags?.svg || country.flags?.png || '';

      const li = document.createElement('li');
      li.classList.add('phone-option');
      li.setAttribute('role', 'option');
      li.id = `phone-option-${isoCode.toLowerCase()}`;
      li.dataset.searchLabel = buildSearchLabel(country, prefix).toLowerCase();
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

    phoneOptionElements = Array.from(
      dropdownList.querySelectorAll('.phone-option')
    );
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

  async function initDropdown() {
    try {
      allCountries = await fetchCountries();
      renderDropdownOptions(allCountries);

      const userLoc = await fetchUserLocation();
      const userCountryCode = userLoc.country_code;
      const matchIndex = phoneOptionElements.findIndex(
        (el) =>
          el.dataset.countryCode.toLowerCase() ===
          userCountryCode.toLowerCase()
      );
      if (matchIndex > -1) {
        phoneOptionElements[matchIndex].click();
      }

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
  dropdownToggle.addEventListener('click', () => {
    const isOpen = dropdownContent.style.display === 'block';
    toggleDropdown(!isOpen);
  });

  searchInput.addEventListener('input', handleSearch);

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.phone-prefix-dropdown')) {
      toggleDropdown(false);
    }
  });

  // -----------------------------
  // 7. START
  // -----------------------------
  initDropdown();
})();
