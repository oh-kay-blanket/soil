# Scripts

## csv-to-json.js

This script automatically converts `src/soil.csv` to `src/soil.json` format.

### Usage

The script is automatically run before webpack starts or builds via npm hooks:

- `npm start` - Runs `prestart` hook which converts CSV to JSON, then starts webpack dev server
- `npm run build` - Runs `prebuild` hook which converts CSV to JSON, then builds for production

You can also run the conversion manually:

```bash
npm run convert-csv
```

### What it does

1. Reads the CSV file from `src/soil.csv`
2. Parses the tab-separated values
3. Converts each row to a JSON object using the first row as headers
4. **Omits empty fields** to reduce file size
5. **Minifies the JSON** (removes all whitespace and formatting)
6. Writes the minified JSON to `src/soil.json`
7. Provides detailed logging of the conversion process including file size reduction

### File format

The CSV should be tab-separated with headers in the first row. The script will:

- Trim whitespace from headers and values
- **Skip empty fields entirely** (not included in JSON output)
- Handle missing values gracefully
- Preserve all original data structure for non-empty fields
- **Output minified JSON** (no indentation or line breaks)

### Size optimization

The script removes empty fields and minifies the JSON to reduce file size. This typically results in:

- 5-15% smaller file size from removing empty fields
- Additional 10-20% reduction from minification
- Faster loading times
- Reduced bandwidth usage

### Integration

The script is integrated into the build process via npm hooks:

- `prestart` - Runs before `npm start`
- `prebuild` - Runs before `npm run build`

This ensures the JSON file is always up-to-date when you start development or build for production.

### Code compatibility

The `mapFunctions.js` file has been updated to handle missing properties gracefully:

- Uses fallback values for missing fields (e.g., "Unknown City" for missing City)
- Only creates markers for entries with valid location data
- Safely handles undefined properties without errors

### Output format

The JSON is minified for optimal file size:

- No indentation or line breaks
- No trailing commas
- Compact representation
- Still valid JSON that can be parsed by any standard JSON parser
