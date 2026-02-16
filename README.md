# USA Covid-19 Dashboard

## AI Disclosure
I used AI in this assignment for: Debugging JS Script only. I did not use AI to write or complete any components where AI use is prohibited. If AI was used for debugging or development, I am able to explain the relevant code and decisions.

[Map Link](https://kridang.github.io/smart-dash/index.html)

## Description
This smart dashboard visualizes the spatial distribution of COVID-19 cases across the United States using an interactive web map and dynamic data visualizations. The goal of this dashboard is to help users quickly explore geographic patterns, compare regions, and understand trends in case counts.

**Map Type**: Proportional Symbols Map
The map uses proportional circles to represent COVID-19 case counts at the county level. Clusters aggregate nearby counties at low zoom levels, while individual counties are revealed when zoomed in. Clicking on a county circle displays a popup with detailed case and death counts. The dynamic info panel updates as users pan and zoom, showing the total deaths within the current map bounds.

## Visualization Components
- **Interactive Map (Mapbox):** Displays COVID-19 data by region.
- **Dynamic Info Panel:** Shows the total number of COVID-19 deaths currently visible on the map. Updates automatically as the user moves the map. Updates when users click on a county to show statistics.
- **Chart (C3.js):** Displays the top 10 counties in the USA with the highest case counts. The chart may updates whenever new data is loaded or the dashboard resets.
- **Legend:** Explains color and data ranges.
- **Reset Button:** Restores default dashboard view.
- **Instruction Panel:** Provides guidance and statistics on dashboard

## Dataset
This dashboard uses publicly available COVID-19 datasets that provide geographic case data for the United States. The dataset includes regional case counts from 2020.

## Libraries in Use
- **Mapbox GL JS** — interactive map
- **C3.js** — Chart
- **HTML / CSS / JavaScript** — UX/UI

## Acknowledgement
Special thanks to the course instructors for providing instruction to the lab, and to New York Times, the U.S. Census Bureau, and the American Community Survey for the datasets.