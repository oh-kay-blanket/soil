const fs = require('fs')
const path = require('path')

function convertCsvToJson() {
	try {
		// Read the CSV file
		const csvPath = path.join(__dirname, '../src/soil.csv')
		const jsonPath = path.join(__dirname, '../src/soil.json')

		console.log('📖 Reading CSV file...')
		const csvContent = fs.readFileSync(csvPath, 'utf8')

		// Split the CSV into lines and filter out empty lines
		const lines = csvContent.split('\n').filter((line) => line.trim() !== '')

		if (lines.length === 0) {
			console.error('❌ CSV file is empty')
			return
		}

		// Parse headers (first line)
		const headers = lines[0].split('\t').map((header) => header.trim())
		console.log(`📋 Found ${headers.length} columns: ${headers.join(', ')}`)

		// Parse data rows
		const jsonData = []

		for (let i = 1; i < lines.length; i++) {
			const line = lines[i]
			const values = line.split('\t')
			const row = {}

			// Map each header to its corresponding value, omitting empty ones
			headers.forEach((header, index) => {
				// Handle cases where there are fewer values than headers
				const value = values[index] !== undefined ? values[index].trim() : ''

				// Only add the property if it has a non-empty value
				if (value !== '') {
					row[header] = value
				}
			})

			jsonData.push(row)
		}

		// Write the JSON file with minified formatting (no whitespace)
		console.log(`🔄 Converting ${jsonData.length} rows...`)
		const jsonContent = JSON.stringify(jsonData)
		fs.writeFileSync(jsonPath, jsonContent, 'utf8')

		// Calculate size reduction
		const originalSize = fs.statSync(csvPath).size
		const newSize = fs.statSync(jsonPath).size
		const reduction = (((originalSize - newSize) / originalSize) * 100).toFixed(
			1
		)

		console.log(
			`✅ Successfully converted CSV to JSON: ${jsonData.length} entries written to soil.json`
		)
		console.log(`📁 Output file: ${jsonPath}`)
		console.log(
			`📊 File size: ${(newSize / 1024).toFixed(
				1
			)} KB (${reduction}% smaller than CSV)`
		)
		console.log(`🔧 JSON is minified (no whitespace)`)
	} catch (error) {
		console.error('❌ Error converting CSV to JSON:', error.message)
		console.error('Stack trace:', error.stack)
		process.exit(1)
	}
}

// Run the conversion
convertCsvToJson()
