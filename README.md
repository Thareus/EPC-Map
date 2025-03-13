# EPC-Map
Quick project to explore the EPC dataset and work with the Ordnance Survey Open UPRN dataset

I downloaded a Bristol subset of the EPC ratings dataset available here https://epc.opendatacommunities.org/downloads/domestic#local-authority
I combined this with the Open UPRN dataset from Ordnance Survey available here https://docs.os.uk/os-downloads/identifiers/os-open-uprn
This gave each property in the dataset a latitude and longitude.

I used Django to load this data into a Postgresql database and visualised it on a Leaflet map.
The amount of data visible on the map is a fraction of what is available, but it's a good enough stopping place.

I reused quite a lot of elements from previous projects so there are some redundant files in this repo.

![Screenshot 2025-03-13 at 13-08-30 ](https://github.com/user-attachments/assets/714c86da-a0d5-40d1-a346-b922551ae42a)
