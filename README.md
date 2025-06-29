# soil

A map of my world travels. Made with the Google Maps JavaScript API.

To replicate, you must create src/index.html and include the API key (which can't be shared on GitHub).

test

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="ie=edge" />
		<title>Soil - My Travel Map</title>
	</head>
	<body>
		<section id="root"></section>
		<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE"></script>
	</body>
</html>
```

4. **Start the development server**
   ```bash
   npm start
   ```

## Security Note

⚠️ **Important**: Never commit your actual Google Maps API key to version control. The API key in this README is a placeholder. Always use environment variables or secure configuration management in production.

## Technologies Used

- Google Maps JavaScript API
- HTML5
- CSS3
- JavaScript (ES6+)

## License

This is a personal project for tracking my travels. Feel free to use as inspiration for your own travel map!
