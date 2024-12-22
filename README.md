# Phone Number Prefix Search in HTML, JS, CSS

This project demonstrates a smart customizable phone prefix dropdown with advanced features like dynamic country fetching, user geolocation, search functionality, and ARIA-compliant keyboard navigation. The dropdown includes a spinner while loading and a search bar to filter by country name, code, or prefix.

---

## Features

- **Dynamic Data Fetching**:
  - Fetches country data from [REST Countries](https://restcountries.com/v3.1/all).
  - Determines user location via [GeoJS](https://get.geojs.io/v1/ip/geo.json).

- **Interactive Dropdown**:
  - Displays countries with their flags, phone prefixes, and ISO codes.
  - Includes a search input to filter by:
    - Country name (native or common).
    - Phone prefix (e.g., "+41").

- **Accessible Design**:
  - Fully keyboard-navigable.
  - ARIA-compliant for assistive technologies.

- **Responsive UI**:
  - Includes a spinner inside the button while data loads.
  - Styled dropdown with smooth interactions and a neat border around flags.

---

## Project Structure

```
root/
├── index.html    # HTML file containing the dropdown structure.
├── style.css     # CSS file for layout, design, and animations.
├── main.js       # JavaScript for data fetching and interactivity.
```

---

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/dropdown-project.git
   ```

2. Navigate to the project directory:
   ```bash
   cd dropdown-project
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

### Behavior
- Adjust the dropdown's functionality by modifying the event listeners in `main.js`.

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

