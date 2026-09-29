import { useState, useEffect } from 'react';
import './App.css';

interface ExchangeRateData {
  rates: Record<string, number>;
}

export default function App() {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency,setFromCurrency] = useState<string>('');
  const [toCurrency, setToCurrency] = useState<string>('');
  const [conversionResult, setConversionResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currencyList, setCurrencyList] = useState<string[]>([]);

  useEffect(() => {
    async function loadInitialCurrencies() {
      try {
        const response = await fetch(`https://open.er-api.com/v6/latest/AED`);
        if (response.ok) {
          const data: ExchangeRateData = await response.json();
          const codes = Object.keys(data.rates);
          setCurrencyList(codes);
        }
      }
      catch (error) {
        console.error("Failed to dynamically populate curruncies: ", error);
      }
    }
    loadInitialCurrencies();
  }, []);
  async function convertCurrency() {

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setConversionResult('Please enter a valid amount');
      return;
    }

    if (!fromCurrency || !toCurrency) {
      setConversionResult('Please select both "From" and "To" currencies');
      return;
    }

    setLoading(true);
    setConversionResult('Loading...');

    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data: ExchangeRateData = await response.json();
      const rate: number = data.rates[toCurrency];
      const convertedAmount = (numericAmount * rate).toFixed(2);
      setConversionResult(`${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`);
    }
    catch (error: any) {
      console.error('Error converting rates: ', error);
      setConversionResult(error.message);
    }
    finally {
      setLoading(false);
    }
  }
  return (
    <div id='app-container'>
      <h1>Currency Converter</h1>
      <div id='converter'>
        <input type='number' placeholder='Enter Amount' value={amount} onChange={(e) => setAmount(e.target.value)}/>
        <label htmlFor='fromCurrency'>From:</label>
        <select id='fromCurrency' value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
          <option value='' disabled>Select</option>
          {currencyList.map((country) =>  (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
        <label htmlFor='toCurrency'>To:</label>
        <select id='toCurrency' value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
         <option value='' disabled>Select</option>
         {currencyList.map((country) =>  (
            <option key={country} value={country}>{country}</option>
          ))} 
        </select>
        <button id='convert-button' onClick={convertCurrency} disabled={loading}>
          {loading ? 'Converting...' : 'Convert'}
        </button>
      </div>
      {conversionResult && <div id='result' className='has-result'>{conversionResult}</div>}
    </div>
  )
}