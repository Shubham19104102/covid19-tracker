import React,{useState,useEffect} from 'react';
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map.js';
import Table from './Table.js';
import { sortData, prettyPrintStat } from "./util";
import LineGraph from './LineGraph.js';
import numeral from "numeral"

import
{
MenuItem,
FormControl,
Select,
Card,
CardContent
} from "@material-ui/core";

function App() {
  const [countries,setCountries]=useState([
    'USA','UK','INDIA'
  ]);
  const [country,setCountry]=useState("worldwide");
  const [countryInfo,setCountryInfo]=useState({});
  const [tableData,setTableData]=useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  useEffect(() => {
      fetch("https://disease.sh/v3/covid-19/all").then(result=>result.json())
      .then(data=>{
        setCountryInfo(data);
      })
  }, [])
  useEffect(() => {
      const getCountriesData=async()=>{
        await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response)=>response.json())
        .then((data)=>{
          const countriesData=data.map((country)=>(
            {
              name:country.country,
              value:country.countryInfo.iso2,
            }

          ));
          setTableData(data);
          setCountries(countriesData);
          setMapCountries(data);
        });
      }
      getCountriesData();
  }, []);
  async function onCountryChange(event){
    const newCountry=event.target.value;


    const url = newCountry ==='worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${newCountry}`;
    await fetch(url)
    .then (response => response.json())
    .then (data  => {
        setCountry(newCountry);
        setCountryInfo(data);
        if (newCountry === "worldwide") {
            setMapCenter([34.80746, -40.4796]);
            setMapZoom(2);
          } else {
            setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
            setMapZoom(4);
          }

    });
    console.log(countryInfo);
  }

  return (
    <div className="app">
      <div className="app_left">
      <div className="app_header">
        <h1 className="app_main_title">Covid-19 Tracker</h1>
        <FormControl className="app_dropdown">
          <Select
          variant="outlined"
          onChange={onCountryChange}
          value={country}>
          <MenuItem value="worldwide">Worldwide</MenuItem>
          {countries.map((country)=>{
            return <MenuItem value={country.value}>{country.name}</MenuItem>
          })}
          {  /*<MenuItem value="Worldwide">Worldwide</MenuItem>
            <MenuItem value="Worldwide">opt 2</MenuItem>
            <MenuItem value="Worldwide">yoo</MenuItem>
            <MenuItem value="Worldwide">ht sexy</MenuItem>*/}
          </Select>
        </FormControl>
     </div>
     <div className="app_stats">
     <InfoBox
        onClick={(e) => setCasesType("cases")}
        title="Coronavirus Cases"
        isRed
        active={casesType === "cases"}
        cases={prettyPrintStat(countryInfo.todayCases)}
        total={numeral(countryInfo.cases).format("0.0a")}
      />
      <InfoBox
        onClick={(e) => setCasesType("recovered")}
        title="Recovered"
        active={casesType === "recovered"}
        cases={prettyPrintStat(countryInfo.todayRecovered)}
        total={numeral(countryInfo.recovered).format("0.0a")}
      />
      <InfoBox
        onClick={(e) => setCasesType("deaths")}
        title="Deaths"
        isRed
        active={casesType === "deaths"}
        cases={prettyPrintStat(countryInfo.todayDeaths)}
        total={numeral(countryInfo.deaths).format("0.0a")}
      />
     </div>
     <Map countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}/>

      </div>
      <Card className="app_right">
        <CardContent>
        <h3 class="app_main_title">Live cases by Countries</h3>
        <Table countries={sortData(tableData)}/>
        <h3 class="app_main_title">{`Worldwide new ${casesType}`}</h3>
        <LineGraph casesType={casesType} />
        </CardContent>
      </Card>

   </div>
  );
}

export default App;
