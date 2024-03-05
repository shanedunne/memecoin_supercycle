document.addEventListener('DOMContentLoaded', () => {

    let coinImages = {};
  
    async function fetchCoinInfo() {
      try {
        const response = await fetch('/api/coininfo');
        const data = await response.json();
        // Assuming `data` is an object with coin IDs as keys and their info, including images, as values
        coinImages = data; // Store the coin images for later use
      } catch (error) {
        console.error('Failed to fetch coin info:', error);
      }
    }
    
    async function renderMarketCapChart() {
      try {
  
        await fetchCoinInfo();
  
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
  
        // Find the maximum market cap
        const maxMarketCap = Math.max(...marketCaps);
        // Calculate 20% longer than the largest market cap
        
        const maxScaleValue = maxMarketCap * 1.10; // 20% more than the largest market cap
        const maxMarketCapRounded = Math.round(maxScaleValue/1000000000)*1000000000;
  
        // Define the chart data
        const chartData = {
          labels: labels,
          datasets: [{
            label: 'Market Cap',
            data: marketCaps,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
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
            indexAxis: 'x', // Correct placement to ensure the chart is horizontal
            plugins: {
              tooltip: {
                enabled: false
              },
              legend: {
                display: false
              }
            },
            scales: {
              x: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Market Cap (USD)'
                },
                max: maxMarketCapRounded // Correct use of maxScaleValue
              }
            },
            hover: {
              animationDuration: 0 // Disable hover animations
            },
            animation: {
              onComplete: function() {
                var ctx = this.ctx;
                this.data.datasets[0].data.forEach((value, index) => {
                  var imageSrc = this.data.datasets[0]._coinImages[index]; // Get the image source
                  if (imageSrc) {
                    var img = new Image();
                    img.src = imageSrc;
                    img.onload = () => {
                      // Define maximum image dimensions
                      const maxImgWidth = 80; // Maximum image width, e.g., 30 pixels
                      const maxImgHeight = 80; // Maximum image height, e.g., 30 pixels
                      // Calculate scaling factor to maintain aspect ratio
                      const scaleFactor = Math.min(maxImgWidth / img.width, maxImgHeight / img.height);
                      // Calculate new dimensions based on scaling factor
                      const scaledWidth = img.width * scaleFactor;
                      const scaledHeight = img.height * scaleFactor;
                      // Calculate position to center the image
                      var x = this.getDatasetMeta(0).data[index].x - scaledWidth / 2;
                      var y = this.getDatasetMeta(0).data[index].y - scaledHeight - 10; // Adjust based on your needs
                      // Draw the image with new dimensions
                      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                    };
                  }
                });
              }
            }
            
          }
        };
  
        new Chart(document.getElementById('marketCapChart'), config);
      } catch (error) {
        console.error('Failed to render market cap chart:', error);
      }
    }
  
    renderMarketCapChart();
  });