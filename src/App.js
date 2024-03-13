import React, { useState, useEffect } from "react";
import "./app.scss";
import { SunOutlined } from "@ant-design/icons";
import { Card, Button, Input, Select, Col, Row, Progress, Image } from 'antd';
import Cloudy from "./img/cloudy.png";

const App = () => {
  // States for cities and parameter values
  const [firstCity, setFirstCity] = useState("");
  const [secondCity, setSecondCity] = useState("");
  const [selectedParameter, setSelectedParameter] = useState("");
  const [parameters, setParameters] = useState([]);
  const [aqiValueOfFirstCity, setAqiValueOfFirstCity] = useState("");
  const [aqiValueOfSecondCity, setAqiValueOfSecondCity] = useState("");
  const [comparisonMessage, setComparisonMessage] = useState("");

  const [firstCityJson, setFirstCityJson] = useState(null);
  const [secondCityJson, setSecondCityJson] = useState(null);
  const [cityMeasurementsDisplay, setCityMeasurementsDisplay] = useState(null);

  // Pulling parameters with useEffect hook
  useEffect(() => {
    const fetchParameters = async () => {
      const response = await fetch(
        "https://api.openaq.org/v2/parameters?limit=100&page=1&offset=0&sort=asc&order_by=id"
      );
      const data = await response.json();
      setParameters(data.results);
    };

    fetchParameters();
  }, []);

  // Display fonksiyonunu güncelleme
  useEffect(() => {
    // JSX for displaying city measurements
    const display = (
      <div>
        {firstCity && aqiValueOfFirstCity && firstCityJson && (
          <div>
            <h2>{firstCity}</h2>
            <ul>
              {firstCityJson.results
                .find((result) => result.city === firstCity)
                ?.measurements.map((measurement, index) => (
                  <li key={index}>{`${measurement.parameter}: ${measurement.value}`}</li>
                ))}
            </ul>
          </div>
        )}
        {secondCity && aqiValueOfSecondCity && secondCityJson && (
          <div>
            <h2>{secondCity}</h2>
            <ul>
              {secondCityJson.results
                .find((result) => result.city === secondCity)
                ?.measurements.map((measurement, index) => (
                  <li key={index}>{`${measurement.parameter}: ${measurement.value}`}</li>
                ))}
            </ul>
          </div>
        )}
      </div>
    );

    setCityMeasurementsDisplay(display);
  }, [firstCity, secondCity, firstCityJson, secondCityJson, aqiValueOfFirstCity, aqiValueOfSecondCity]);


  const handleFirstCityChange = (event) => {
    setFirstCity(event.target.value);
    setFirstCityJson(null); 
  };

  const handleSecondCityChange = (event) => {
    setSecondCity(event.target.value);
    setSecondCityJson(null);
  };

  const handleParameterChange = (event) => {
    setSelectedParameter(event.target.value);
  };

  // Handler function to calculate AQI values when Calculate button is clicked
  const handleCalculate = async () => {
    if (!selectedParameter || !firstCity || !secondCity) {
        throw new Error(`Fill in all the information.`);
    }
  
    try {
      // fetch data for city1
      const responseMeasurementsOfFirstCity = await fetch(`https://api.openaq.org/v1/latest?city=${firstCity}`);
      const firstCityJson = await responseMeasurementsOfFirstCity.json();
  
      const firstCityData = firstCityJson.results.find((result) => result.city === firstCity);
  
      if (!firstCityData) {
        throw new Error(`No data found for ${firstCity}`);
      }
  
      const measurementOfSelectedParameterForFirstCity = firstCityData.measurements.find((measurement) => measurement.parameter === selectedParameter);
  
      if (!measurementOfSelectedParameterForFirstCity) {
        throw new Error(`The selected parameter for ${firstCity} was not found.`);
      }
  
      setAqiValueOfFirstCity(measurementOfSelectedParameterForFirstCity.value);
      setFirstCityJson(firstCityJson);
  
      // fetch data for city2
      const responseMeasurementsOfSecondCity = await fetch(`https://api.openaq.org/v1/latest?city=${secondCity}`);
      const secondCityJson = await responseMeasurementsOfSecondCity.json();
  
      const secondCityData = secondCityJson.results.find((result) => result.city === secondCity);
  
      if (!secondCityData) {
        throw new Error(`No data found for ${secondCity}.`);
      }
      const measurementOfSelectedParameterForSecondCity = secondCityData.measurements.find((measurement) => measurement.parameter === selectedParameter);
  
      if (!measurementOfSelectedParameterForSecondCity) {
        throw new Error(`The selected parameter for ${secondCity} was not found.`);
      }
  
      setAqiValueOfSecondCity(measurementOfSelectedParameterForSecondCity.value);
      setSecondCityJson(secondCityJson);
  
      // Compare two cities
      if (aqiValueOfFirstCity === aqiValueOfSecondCity) {
        setComparisonMessage(`AQI values for the two cities are equal. ${firstCity}: ${measurementOfSelectedParameterForFirstCity.value}, ${secondCity}: ${measurementOfSelectedParameterForSecondCity.value}`);
      } else {
        setComparisonMessage(
          aqiValueOfFirstCity > aqiValueOfSecondCity
            ? `The AQI value for ${firstCity} is higher than the AQI value for ${secondCity}. ${firstCity}: ${measurementOfSelectedParameterForFirstCity.value}, ${secondCity}: ${measurementOfSelectedParameterForSecondCity.value}`
            : `The AQI value for ${secondCity} is higher than the AQI value for ${firstCity}. ${firstCity}: ${measurementOfSelectedParameterForFirstCity.value}, ${secondCity}: ${measurementOfSelectedParameterForSecondCity.value}`
        );
      }


      // JSX for displaying city measurements
      const display = (
        <div>
          {firstCity &&
            aqiValueOfFirstCity &&
            firstCityJson && ( // firstCityJson null değilse display yap
              <div>
                <h2>{firstCity}</h2>
                <ul>
                  {firstCityJson.results
                    .find((result) => result.city === firstCity)
                    ?.measurements.map((measurement, index) => (
                      <li key={index}>
                        {`${measurement.parameter}: ${measurement.value}`}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          {secondCity &&
            aqiValueOfSecondCity &&
            secondCityJson && ( // secondCityJson null değilse display yap
              <div>
                <h2>{secondCity}</h2>
                <ul>
                  {secondCityJson.results
                    .find((result) => result.city === secondCity)
                    ?.measurements.map((measurement, index) => (
                      <li key={index}>
                        {`${measurement.parameter}: ${measurement.value}`}
                      </li>
                    ))}
                </ul>
              </div>
            )}
        </div>
      );

      setCityMeasurementsDisplay(display);
      
    } catch (error) {
      setComparisonMessage(error.message);
    }

  };

  const conicColors = {
    '0%': '#87d068',
    '50%': '#ffe58f',
    '100%': 'rgb(255, 0, 0)',
  };

  return (
    <div className="app-wrapper">
      <Row>
        <Col span={20}>
          <Card className="card-weather">
            <Row>
              <Col span={12}>
                <Card className="card-degree">
                  <label className="center">Rain Showers</label>
                  <span className="center">29°</span>
                  <div className="weather-img">
                    <Image
                      width={150}
                      src={Cloudy}
                      preview={false}
                      alt="cloudy"
                    />
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <div className="weather-options">
                  <div className="active">
                    <span>Today</span>
                  </div>
                  <div>Tomorrow</div>
                  <div>Next 15 days </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col span={20}>
          <Card>
            <div className="card-wrapper">
              <h1 className="app-title center">
                Air Quality Comparison App
                <SunOutlined />
              </h1>
              <div className="text-center">
                  <Row>
                    <Col span={12}>
                      <Progress type="dashboard" percent={99} strokeColor={conicColors} style={{width: "240px", height: "240px"}}/>
                    </Col>
                    <Col span={12}>
                      <div className="app-sub-title">
                        <label>First City:</label>
                        <Input type="text" value={firstCity} onChange={handleFirstCityChange} />
                      </div>
                      <br />
                      <div className="app-sub-title">
                          <label>Second City:</label> 
                          <Input type="text" value={secondCity} onChange={handleSecondCityChange} />
                      </div>
                    </Col>
                  </Row>
                  
                  <br />
                  <div className="app-sub-title">
                      <label>Select Parameter:</label> 
                      <Select value={selectedParameter} onChange={handleParameterChange}>
                        <option value="">Choose Parameter</option>
                          {parameters.map((param) => (
                            <option key={param.id} value={param.name}>
                            {param.displayName || param.name}
                            </option>
                          ))}
                      </Select>
                  </div>
                  <br />
                  <Button type="primary" onClick={handleCalculate} className="app-compare-btn">Compare</Button>
                  <br />
                  <br />
                  {comparisonMessage && <p>{comparisonMessage}</p>}
                  <br />
                  <br />
                  {cityMeasurementsDisplay}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default App;