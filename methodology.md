# Methodology
## [Cleaning](https://github.com/jennahgosciak/nyu_ownership/blob/main/00_data_prep.Rmd)
1. I extracted all NYU owned-properties from [New York City Department of Finance Real Property Assessment Data (RPAD)](https://www1.nyc.gov/site/finance/taxes/property-assessments.page) for 1997-1998 (1999 and 2000 are missing the owner field) and 2001-2021. I saved this as an RDS file.
2. I pulled the [New York City Department of Finance Real Property Assessment Data (RPAD)](https://www1.nyc.gov/site/finance/taxes/property-assessments.page) from the Furman Center database for years prior to 2002. To extract NYU's ownership I used a regular expression. I also merged the file onto 2002 PLUTO data, which is also located on the Furman Center's database. PLUTO stands for the [New York City Department of City Planning Primary Land Use Tax Output data](https://www1.nyc.gov/site/planning/data-maps/open-data/dwn-pluto-mappluto.page). I renamed some of the variables and restricted the variables for the analysis.
3. To improve some of the low property counts in early years, I tried merging unmerged cases from other years (e.g. lots with a year built earlier than 2002 that appeared in later PLUTO records, but not in RPAD). I then merged this file to 2002 PLUTO data, to get the geometries, and appended it to the original extract of NYU properties from the RPAD data.
4. I next turned to PLUTO. I needed to load 2008 PLUTO data manually, as it's not in the Furman Center database. I loaded the 2008 data, restricted the variables for analysis and renamed variables, and then extracted NYU properties using the same regular expression as in step 1. I also pre-emptively extracted the average value of all buildings with a land use of mixed commercial or commercial and office buildings for later recalculating assessed value.
5. Then, I considered all other years of PLUTO data from 2002-2021. I extracted all possible records from the data using the same regular expressions. I checked my work in several ways. Initially, I exported a list of all property owners in each year. To speed things up, I eventually exported a list of all unique owners at the end of the process. In some cases, there were some incorrect matches of individual names that I manually excluded. Additionally, I went back and forth on whether to include the Polytechnic Institute of Brooklyn and I noticed a building in Crown Heights was listed with NYU as an owner in one year, when ACRIS had no record of any involvement from NYU. These are two examples of manual changes I made after compiling these files programmatically.
6. Ultimately, I appended together extracts of PLUTO data 2002-2007 and 2009-2021, 2008 PLUTO data, and RPAD data for 1997-2001.
	* I later discovered that the 1999 and 2000 RPAD data files are missing the owner field and the 1997 and 1998 files seem like they might have data inconsistencies. Additionally, the RPAD data's unique identifier (BBL) is likely denoting condo units and not buildings. If I had more time to parse through this, I imagine that I could produce cleaner estimates of NYU's property ownership prior to 2002. However, there were too many data inconsistencies that I decided to simply limit my analysis to 2001-2021 (which includes one year of RPAD data).
7. To check my work, I wrote a function that ran 'naive' searches on all years of PLUTO data. I also examined the effects of merging all unique identifiers (BBLs) back onto my full dataset to see if what wasn't merging was truely a new building/sale or if it was a data inconsistency.
8. Lastly, I calculated the average assessed value for commercial mixed use and commercial and office space land uses by community district. I appended the 2008 record to this dataframe.

## [Analysis](https://github.com/jennahgosciak/nyu_ownership/blob/main/01_analysis_1998_2021.Rmd)
1. I start by loading data from the [Bureau of Labor Statistics](https://www.bls.gov/cpi/research-series/r-cpi-u-rs-home.htm) on the CPI. I pull out the average for 2020 and divide all years by this value.
	* I realize that essentially I am only adjusting for 2020 dollars, not 2021. I could not find a dataset that included 2021 (since I wanted to make sure the data was from the same source) and I figured that this calculation was nearly approximate.
2. Next I loaded all the data: point data, polygon data, and polygon data just for 2021. I applied some basic cleaning steps to unify and format certain variables.
3. I loaded additional spatial data files from the NYC Open Data Portal and the New York City Department of City Planning website.
	* [Boroughs](https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/NYC_Borough_Boundary/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=pgeojson)
	* [Neighborhoods](https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/NYC_Neighborhood_Tabulation_Areas_2020/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=pgeojson)
	* [Streets](https://data.cityofnewyork.us/resource/m6hn-ddkx.geojson?$limit=200000)
	* [Roads](https://data.cityofnewyork.us/resource/gdww-crzy.geojson)
	* [Community districts](https://data.cityofnewyork.us/resource/jp9i-3b7y.geojson?$limit=200000)
	* [Parks](https://data.cityofnewyork.us/resource/y6ja-fw4f.geojson?$limit=200000)
4. Then I produced individual maps for each community district that intersects an NYU-owned building. I also calculated general statistics around the share of property ownership, the share of buildings, etc.
5. Then I produced summary tables--these tables further compare NYU's property ownership to the city as a whole and also calculate the top ten owners by different measures.
	* I noticed that dropping ownertype values of "C" (city-owned properties) and "O" - other state, federal, or public ownership does not remove all publicly owned buildings.
	* The summary tables only use this restriction, but for displaying the top-ten owners I removed additional public/governmental agencies.
	* I needed to manually drop some city and government properties. Also, I acknowledge that this process is imperfect, given the discrepancies around spelling and other differences with owner names.
	* I produced graphs for these summary tables.
6. I next loaded data on property tax rates. I copied this from the [New York City Department of Finance website](https://www1.nyc.gov/site/finance/taxes/property-tax-rates.page). I formatted the numbers in R and turned them into decimals.
7. Starting with the polygon data, I left joined onto the property tax rates, the CPI conversion factors (from step 1), and the average assessed value by year and community district. I used key variables from these three dataframes to calculate: (1) a revised estimate of assessed value adjusted for inflation, (2) the estimated taxes NYU would have paid adjusted for inflation.
8. I noticed that some records were missing geometries. To fix this, I attempt to geocode records with address and merge onto PLUTO 2021 data. I then appended these files back onto the original file. This process was more relevant when I was trying to get geometries for 1999 and 2000, but ultimately, given the complexity of that task, I decided against it.
9. Lastly, I created a series of plots visualized change in NYU's property ownership over time. These plots used existing variables created in steps 1-8.
10. I created these same plots just using RPAD data, since RPAD data has owner information on condos.
11. I produced 4 maps comparing property ownership in 2002 and 2021 using both data sources: PLUTO and RPAD. These maps summarize counts of ownership at the community district level and use community district polygons.
12. I geocoded the RPAD data using a cleaned version of the address (concatenating street number, street name, city, state, and zip code).
13. I then merged the RPAD data to 2021 PLUTO data to get the latitude and longitude in point format. I also replaced missing addresses with the correct latitude and longitude (I found this by googling the property and making use of Chris Whong's [NYCityMap](http://maps.nyc.gov/doitt/nycitymap/)).
14. I used `st_jitter()` to move the points slightly (in the case that they might be directly on top of each other).
	* I exported this as a geojson file for a second interactive map.

## [ACRIS Analysis](https://github.com/jennahgosciak/nyu_ownership/blob/main/02_analysis_acris.Rmd)
1. With the [New York City Department of Finance Automated City Register Information System (ACRIS)](https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Master/bnx9-e6tj), I merged together the parties file, the master file, the document control codes, and the ACRIS legals file. I also used the same regular expression as in previous steps to extract NYU properties.
2. I then manually filtered out some names that were incorrectly extracted.
3. I restricted the data to deed records, as I observed from seaching ACRIS records that deed records were more useful and clear.
4. I extracted the year from the document date, and took the minimum of several dates (recorded_filing, modified_date, and doc_date) to fix missing values.
5. I used `party_type` values of 1 = "Seller" and 2 = "Buyer"
6. Then I produced a graph of all deed records by year.

## Interactive Maps
* The interactive maps are located in [04_WebMap](https://github.com/jennahgosciak/nyu_ownership/tree/main/04_WebMap) and [04_WebMap_Condo](https://github.com/jennahgosciak/nyu_ownership/tree/main/04_WebMap)
* They were not written in R and are based on the html, javascript, and css files in the folders stored there.
* I didn't apply any transformations to the data in this process (i.e. everything analytic occurred in R)

## Data Sources
* [New York City Department of Finance Real Property Assessment Data (RPAD)](https://www1.nyc.gov/site/finance/taxes/property-assessments.page)
* [New York City Department of City Planning Primary Land Use Tax Output](https://www1.nyc.gov/site/planning/data-maps/open-data/dwn-pluto-mappluto.page)
* [New York City Department of Finance Automated City Register Information System (ACRIS)](https://data.cityofnewyork.us/City-Government/ACRIS-Real-Property-Master/bnx9-e6tj)
* [Boroughs](https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/NYC_Borough_Boundary/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=pgeojson)
* [Neighborhoods](https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/NYC_Neighborhood_Tabulation_Areas_2020/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=pgeojson)
* [Streets](https://data.cityofnewyork.us/resource/m6hn-ddkx.geojson?$limit=200000)
* [Roads](https://data.cityofnewyork.us/resource/gdww-crzy.geojson)
* [Community districts](https://data.cityofnewyork.us/resource/jp9i-3b7y.geojson?$limit=200000)
* [Parks](https://data.cityofnewyork.us/resource/y6ja-fw4f.geojson?$limit=200000)
* [Bureau of Labor Statistics, Consumer Price Index, All Items, 1977-2020](https://www.bls.gov/cpi/research-series/r-cpi-u-rs-home.htm)
* [Department of Finance, Property Tax Rates by Year](https://www1.nyc.gov/site/finance/taxes/property-tax-rates.page)
