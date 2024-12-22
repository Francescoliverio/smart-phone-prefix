# Smart Phone Number Prefix Search & Timezone in HTML, JS, CSS

This project demonstrates a smart customizable phone prefix dropdown with advanced features like dynamic country fetching, user geolocation, timezone integration, search functionality, and ARIA-compliant keyboard navigation. The dropdown includes a spinner while loading and a search bar to filter by country name, code, or prefix.

---

## Demo

Check out the live demo here: [Smart Phone Number Prefix Search](https://smart-phone-prefix.francescoliverio.com/)

---

## Features

- **Dynamic Data Fetching**:

  - Fetches country data from [REST Countries](https://restcountries.com/v3.1/all).
  - Provides a local fallback (`./data/countries.json`) if the REST API is unavailable.
  - Determines user location via multiple IP geolocation services:
    - [GeoJS](https://get.geojs.io/v1/ip/geo.json)
    - [IPAPI](https://ipapi.co/json/)
    - [IPWhois](https://ipwhois.app/json/)

- **Interactive Dropdown**:

  - Displays countries with their flags, phone prefixes, and ISO codes.
  - Includes a search input to filter by:
    - Country name (native or common).
    - Phone prefix (e.g., "+41").

- **Timezone Integration**:

  - Automatically fetches the user's timezone based on their IP address or selected country.
  - Preselects the country and timezone based on geolocation when the page loads.
  - Displays the timezone in a hidden field, which is submitted with the form data.

- **Accessible Design**:

  - Fully keyboard-navigable.
  - ARIA-compliant for assistive technologies.

- **Responsive UI**:

  - Includes a spinner inside the button while data loads.
  - Styled dropdown with smooth interactions and a neat border around flags.
  - Adjusts layout for mobile devices, stacking dropdown and phone number inputs vertically.

---

## Project Structure

```
root/
├── index.html    # HTML file containing the dropdown structure.
├── style.css     # CSS file for layout, design, and animations.
├── main.js       # JavaScript for data fetching and interactivity.
├── data/
│   └── countries.json # Local fallback data for countries.
```

---

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/Francescoliverio/smart-phone-prefix.git
   ```

2. Navigate to the project directory:

   ```bash
   cd smart-phone-prefix
   ```

3. Open `index.html` in a browser to view the dropdown:

   ```bash
   open index.html
   ```

---

## Usage

1. **Dropdown Interaction**:

   - Click the button to open the dropdown.
   - Use the search bar to filter countries by name, code, or prefix.

2. **Keyboard Navigation**:

   - Use `Arrow Down` and `Arrow Up` to navigate options.
   - Press `Enter` or `Space` to select an option.
   - Press `Escape` to close the dropdown.

3. **Geolocation**:

   - On page load, the dropdown attempts to set your country based on your IP.
   - The timezone is fetched automatically and displayed in the hidden input field.

4. **Form Submission**:

   - When the form is submitted, the selected phone prefix, phone number, and timezone are displayed as JSON in a styled block.

---

## Customization

### Styling

- Modify `style.css` to change the appearance.
- For example, to change the border around the flags:
  ```css
  .selected-flag {
    border: 2px solid #000;
    border-radius: 4px;
  }
  ```

### Data Sources

- Replace the `fetchCountries` or `fetchUserLocation` functions in `main.js` to use alternative APIs or data sources.
- Add or modify the local fallback data in `./data/countries.json` if needed.

### Timezone Handling

- Update the `fetchUserLocation` or `handleCountrySelection` functions to integrate with other timezone APIs if needed (e.g., Google Time Zone API).

---

## Dependencies

This project is built with vanilla JavaScript and does not require any external libraries or frameworks.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-branch-name`.
3. Commit your changes: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature-branch-name`.
5. Open a pull request.

---

## Acknowledgments

- [REST Countries API](https://restcountries.com/v3.1/all) for country data.
- [GeoJS API](https://get.geojs.io/) for IP geolocation.
- [IPAPI](https://ipapi.co/json/) and [IPWhois](https://ipwhois.app/json/) as fallback geolocation services.
- Local fallback provided via `./data/countries.json`.

Feel free to reach out if you have any questions or suggestions!

