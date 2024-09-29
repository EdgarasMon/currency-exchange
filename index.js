import express from "express";
import axios from "axios";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

const lruCache = new Map();
const maxCacheSize = 4;
const cacheExpirationTime = 1000 * 60 * 60;
const supportedCurrencies = ["USD", "EUR", "GBP", "ILS"];

const fetchExchangeRateApi = async (baseCurrency) => {
  try {
    if (lruCache.has(baseCurrency)) {
      const { data, timestamp } = lruCache.get(baseCurrency);
      const currentTime = Date.now();

      if (currentTime - timestamp < cacheExpirationTime) {
        console.warn(`Taken from cache ${baseCurrency}`);
        return data;
      }

      lruCache.delete(baseCurrency);
      console.warn(`Cache expired for ${baseCurrency}`);
    }

    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.exchangerateApiKey}/latest/${baseCurrency}`
    );

    const exchangeRates = response.data.conversion_rates;
    if (!exchangeRates) {
      throw new Error(`Exchange rates for ${baseCurrency} not found.`);
    }

    addToLRUCache(baseCurrency, exchangeRates);
    console.warn(`Cache updated for ${baseCurrency}`);

    return exchangeRates;
  } catch (error) {
    console.error("Error fetching exchange rate:", error.message);
    throw error;
  }
};

const addToLRUCache = (key, data) => {
  if (lruCache.size >= maxCacheSize) {
    const firstKey = lruCache.keys().next().value;
    lruCache.delete(firstKey);
    console.warn(`Cache cleared for ${firstKey}`);
  }

  lruCache.set(key, { data, timestamp: Date.now() });
};

app.get("/quote", async (req, res) => {
  const { baseCurrency, quoteCurrency, baseAmount } = req.query;

  if (!baseCurrency || !quoteCurrency || !baseAmount) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  try {
    const exchangeRates = await fetchExchangeRateApi(baseCurrency);
    const exchangeRate = exchangeRates[quoteCurrency];

    if (!exchangeRate) {
      return res
        .status(404)
        .json({ error: `Quote currency ${quoteCurrency} not found` });
    }

    const amountInCents = 100;
    const quoteAmount = Math.round(
      (baseAmount / amountInCents) * exchangeRate * amountInCents
    );

    return res.json({
      exchangeRate: exchangeRate.toFixed(3),
      quoteAmount,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  supportedCurrencies.forEach((currency) => {
    fetchExchangeRateApi(currency);
  });
  console.log(`Server is running on port ${PORT}`);
});
