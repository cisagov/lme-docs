# Table building for FAQ page: 
The code that builds the table is at `/layouts/shortcodes/table.html` in the <script> section.   
Ensure that all cells in the csv file: 

1. Do not contain new lines
2. if you wnat them to have `,` commas in the text, ensure the text is wrapped in `"` quotes.
3. some characters may be interpreted improperly by excel, so you may need to change them back such as `"`, `'`, etc...
