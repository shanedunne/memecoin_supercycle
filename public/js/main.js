document.addEventListener('DOMContentLoaded', () => {

  let coinImages = {};

  async function fetchCoinInfo() {
    try {
      const response = await fetch('/api/coininfo');
      const data = await response.json();
      const loadImagePromises = Object.keys(data).map(key => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({id: key, img: img});
          img.onerror = reject;
          img.src = data[key].logo; // Assuming each entry has a logo URL
        });
      });
      const loadedImages = await Promise.all(loadImagePromises);
      // Transform loadedImages into an object for easier access
      coinImages = loadedImages.reduce((acc, {id, img}) => {
        acc[id] = img;
        return acc;
      }, {});
    } catch (error) {
      console.error('Failed to fetch and preload coin images:', error);
    }
  }
  fetchCoinInfo();
  
  
  async function renderMarketCapChart() {
    try {

      // await fetchCoinInfo();

      const response = await fetch('/api/marketcap');
      const data = await response.json(); // Assuming this is the object with coin IDs as keys
      let coins = Object.values(data); // Convert the object into an array of coin objects

      // Shuffle the array of coins to randomize their order (as previously defined)
      function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
      }

      // Shuffle the array of coins to randomize their order
      shuffleArray(coins);

      // Extract the labels (coin symbols) and data (market caps) for the chart
      const labels = coins.map(coin => coin.symbol);
            const marketCaps = coins.map(coin => coin.quote.USD.market_cap);

            const backgroundColors = new Array(marketCaps.length).fill('rgba(0,0,0,0.1)');
 

            const gradientPlugin = {
              id: 'gradientPlugin',
              afterUpdate: function(chart) {
                chart.data.datasets.forEach((dataset, i) => {
                  const {ctx, chartArea: {bottom, top}} = chart;
                  if (!dataset.backgroundColor) {
                    dataset.backgroundColor = [];
                  }
                  const meta = chart.getDatasetMeta(i);
                  meta.data.forEach((bar, index) => {
                    const gradient = ctx.createLinearGradient(0, bottom, 0, top); // Create a vertical gradient
                    gradient.addColorStop(0, 'rgb(255, 255, 0)'); // Yellow at the bottom
                    gradient.addColorStop(1, 'rgb(255, 0, 0)'); // Red at the top
                    dataset.backgroundColor[index] = gradient; // Apply the gradient
                  });
                });
              }
            };
            
      
      
      


      // Find the maximum market cap
      const maxMarketCap = Math.max(...marketCaps);
      // Calculate 20% longer than the largest market cap
      
      const maxScaleValue = maxMarketCap * 1.60; // 20% more than the largest market cap
      const maxMarketCapRounded = Math.round(maxScaleValue/1000000000)*1000000000;
      const imagePlugin = {
        id: 'imagePlugin',
        afterDatasetDraw: function(chart, args) {
          const ctx = chart.ctx;
          chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            dataset.data.forEach((value, index) => {
              const coinId = coins[index].id; // Assuming each coin has an 'id' corresponding to 'coinImages'
              const img = coinImages[coinId]; // Directly use the preloaded Image object
              if (img) {
                // Define maximum image dimensions
                const maxImgWidth = 50; // Adjust as needed
                const maxImgHeight = 50; // Adjust as needed
                // Calculate scaling factor to maintain aspect ratio
                const scaleFactor = Math.min(maxImgWidth / img.width, maxImgHeight / img.height);
                // Calculate new dimensions based on scaling factor
                const scaledWidth = img.width * scaleFactor;
                const scaledHeight = img.height * scaleFactor;
                // Calculate position to draw the image on top of the bar
                const model = meta.data[index];
                const x = model.x - scaledWidth / 2;
                // Adjust y position to draw the image on top of the bar
                const y = model.y - scaledHeight - 5; // Subtract additional pixels to ensure a gap between the image and the bar
      
                // Draw the image
                ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
              }
            });
          });
        }
      };
      
      
      
      Chart.register(imagePlugin);
      Chart.register(gradientPlugin);


      // Define the chart data
      const chartData = {
        labels: labels,
        datasets: [{
          label: 'Market Cap',
          data: marketCaps,
          backgroundColor: "#13ba84",
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
          _coinImages: coins.map(coin => coinImages[coin.id]?.logo) // Assuming coinImages is keyed by coin ID
        }]
      };

      // Config object for the chart
      const config = {
        type: 'bar',
        data: chartData,
        options: {
          indexAxis: 'x', 
          plugins: {
            tooltip: {
              enabled: false // Disables tooltips
            },
            legend: {
              display: false // Hides the legend
            },
            // No need to explicitly configure 'imagePlugin' here as it's globally registered
          },
          scales: {
            y: { // Use 'y' for a vertical bar chart
              type: 'logarithmic',
              position: 'left', // 'left' for a vertical bar chart
              ticks: {
                callback: function(value, index, values) {
                  // Return formatted labels (e.g., '100M', '10B')
                  return Number(value).toLocaleString();
                }
              },
              max: maxMarketCapRounded
            },
          },
          hover: {
            animationDuration: 0 // Optionally disable hover animations
          },
          // Removed the old 'onComplete' animation logic since the custom plugin now handles image drawing
        }
      };
      

      new Chart(document.getElementById('marketCapChart'), config);
    } catch (error) {
      console.error('Failed to render market cap chart:', error);
    }
  }

  renderMarketCapChart();
});