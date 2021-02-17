/************************* DOM *************************/
// summary dom
const date = document.querySelector('.date');

let casesCurrent = document.getElementById('casesCurrent');
let deathCurrent = document.getElementById('deathCurrent');
let recoveredCurrent = document.getElementById('recoveredCurrent');

const casesToday = document.getElementById('casesToday');
const deathToday = document.getElementById('deathToday');
const recoveredToday = document.getElementById('recoveredToday');

const casesInfo = document.getElementById('casesInfo');
const deathInfo = document.getElementById('deathInfo');
const recoveredInfo = document.getElementById('recoveredInfo');

// chart dom
let casesRecoveryChart = document
  .getElementById('cases-recovery-chart')
  .getContext('2d');
let deathChart = document.getElementById('death-chart').getContext('2d');

// top-region dom
const topRegionContainer = document.querySelector('.region');

// overview dom
const overviewContainer = document.querySelector('.overview');

// search dom
const searchTitle = document.querySelector('.search-title');
const openSearch = document.querySelector('.open-search');
const searchForm = document.querySelector('.searchForm');
const searchContainer = document.querySelector('.search');
const searchButton = document.querySelector('.search-button');
const searchInput = document.querySelector('.search-input');

/************************* API CALL *************************/
const callApi = async () => {
  const [ph, world, history, region] = await Promise.all([
    fetch('https://disease.sh/v3/covid-19/countries/philippines').then((res) =>
      res.json()
    ),
    fetch('https://disease.sh/v3/covid-19/all').then((res) => res.json()),
    fetch('https://disease.sh/v3/covid-19/historical/philippines').then((res) =>
      res.json()
    ),
    fetch(
      'https://covid19-api-philippines.herokuapp.com/api/top-regions'
    ).then((res) => res.json()),
  ]);

  return (
    summary(ph),
    mychart(history.timeline),
    topRegion(region),
    overview(ph, world)
  );
};

/************************* FUNCTION *************************/
const formatNumber = (num) =>
  num && num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

const myCounter = (target, container) => {
  container.textContent = 0;
  const updateCounter = () => {
    const c = +container.innerText;

    const inc = target / 200;

    if (c < target) {
      container.innerText = c + Math.round(parseInt(inc));
      setTimeout(updateCounter, 1);
    } else {
      container.innerText = formatNumber(target);
    }
  };

  updateCounter();
};

/************************* MAIN FUNCTION *************************/
/***** SUMMARY *****/
const summary = (ph) => {
  date.textContent = `
  (as of ${ph && new Date(ph.updated).toDateString()})
  `;

  // casesCurrent.textContent = formatNumber(ph.cases);
  // deathCurrent.textContent = formatNumber(ph.deaths);
  // recoveredCurrent.textContent = formatNumber(ph.recovered);

  casesCurrent = myCounter(ph.cases, casesCurrent);
  deathCurrent = myCounter(ph.deaths, deathCurrent);
  recoveredCurrent = myCounter(ph.recovered, recoveredCurrent);

  casesToday.textContent = `+ ${formatNumber(ph.todayCases)} TODAY`;
  deathToday.textContent = `+ ${formatNumber(ph.todayDeaths)} TODAY`;
  recoveredToday.textContent = `+ ${formatNumber(ph.todayRecovered)} TODAY`;

  casesInfo.textContent = `${formatNumber(ph.active)} ACTIVE CASES`;
  deathInfo.textContent = `${
    ph && ((ph.deaths / ph.cases) * 100).toFixed(2)
  }% DEATH RATE`;
  recoveredInfo.textContent = `${
    ph && ((ph.recovered / ph.cases) * 100).toFixed(2)
  }% RECOVERY RATE`;
};

/***** CHARTJS *****/
const mychart = (history) => {
  // data destructuring
  const { cases, deaths, recovered } = history;
  // date
  const label = Object.keys(cases);
  // cases
  const casesRate = Object.values(cases);
  // death
  const deathRate = Object.values(deaths);
  // recovered
  const recoverRate = Object.values(recovered);
  //global options
  Chart.defaults.global.defaultFontFamily = 'Roboto';
  Chart.defaults.global.defaultFontColor = 'white';

  // chart data
  const casesRecoveredData = {
    labels: label.slice(-14),
    datasets: [
      {
        label: 'Cases',
        backgroundColor: 'rgba(6, 162, 203, 0.3)',
        borderColor: '#06A2CB',
        hoverBorderWidth: 2,
        hoverBorderColor: '#d0c6b1',
        fill: true,
        data: casesRate.slice(14),
      },
      {
        label: 'Recovery Rate',
        backgroundColor: 'rgba(33, 133, 89, 0.6)',
        borderColor: '#218559',
        hoverBorderWidth: 2,
        hoverBorderColor: '#d0c6b1',
        fill: true,
        data: recoverRate.slice(-14),
      },
    ],
  };

  const deathData = {
    labels: label.slice(-14),
    datasets: [
      {
        label: 'Death Rate',
        backgroundColor: 'rgba(221, 30, 47, 0.5)',
        borderColor: '#DD1E2F',
        hoverBorderWidth: 2,
        hoverBorderColor: '#d0c6b1',
        fill: true,
        data: deathRate.slice(-14),
      },
    ],
  };

  // option
  const chartOption = {
    responsive: true,
    maintainAspectRatio: false,
    title: {
      display: true,
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            color: 'rgba(255, 255, 255, 0.1)',
            zeroLineColor: '#fff',
          },
        },
      ],
      yAxex: [
        {
          display: true,
          gridLines: {
            color: 'rgba(255, 255, 255, 0.1)',
            zeroLineColor: '#fff',
          },
        },
      ],
    },
  };

  let casesRecovered = new Chart(casesRecoveryChart, {
    type: 'line',
    data: casesRecoveredData,
    options: chartOption,
  });

  let death = new Chart(deathChart, {
    type: 'line',
    data: deathData,
    options: chartOption,
  });
};

/***** TOP REGION *****/
const topRegion = (region) => {
  const topRegionHTML = `
    <h3>Top Region</h3>
    <table class="top-region">  
      <tr>
        <th>Region</th>
        <th>Cases</th>
        <th>Deaths</th>
        <th>Recovered</th>
      </tr>
    
      ${region.data
        .map((reg) => {
          return `
        <tr>
          <td>${reg.region.toUpperCase()}</td>
          <td>${formatNumber(reg.cases)}</td>
          <td>${formatNumber(reg.deaths)}</td>
          <td>${formatNumber(reg.recovered)}</td>
        </tr>
        `;
        })
        .join('')}  
    </table>

    <div class="source">
    <a href="https://covid19-api-philippines.herokuapp.com/" target="_blank">UNSTABLE SOURCE</a>
    <span class="last-update">(last-update: ${region.last_update})</span>
    </div>
  `;

  topRegionContainer.innerHTML = topRegionHTML;
};

/***** OVERVIEW *****/
const overview = (ph, world) => {
  const overviewHTML = `
    <div class= "world">
      <h2>World</h2>
      <p><span>Population: </span><strong>${formatNumber(
        world.population
      )}</strong></p>
      <p><span>Tested: </span><strong>${formatNumber(world.tests)}</strong></p>
      <p><span>Active Cases: </span><strong>${formatNumber(
        world.active
      )}</strong></p>
      <p><span>Critical: </span><strong>${formatNumber(
        world.critical
      )}</strong></p>
      <p><span>Total Cases: </span><strong>${formatNumber(
        world.cases
      )}</strong></p>
      <p><span>Total Deaths: </span><strong>${formatNumber(
        world.deaths
      )}</strong></p>
      <p><span>Recovered: </span><strong>${formatNumber(
        world.recovered
      )}</strong></p>
      <p><span>Affected Countries: </span><strong>${formatNumber(
        world.affectedCountries
      )}</strong></p>
    </div>

    <div class="phil">
    <h2>Philippines</h2>
    <p><span>Population: </span><strong>${formatNumber(
      ph.population
    )}</strong></p>
    <p><span>Tested: </span><strong>${formatNumber(ph.tests)}</strong></p>
    <p><span>Active Cases: </span><strong>${formatNumber(
      ph.active
    )}</strong></p>
    <p><span>Critical: </span><strong>${formatNumber(ph.critical)}</strong></p>
    <p><span>Total Cases: </span><strong>${formatNumber(ph.cases)}</strong></p>
    <p><span>Total Deaths: </span><strong>${formatNumber(ph.deaths)}</strong></p>
    <p><span>Recovered: </span><strong>${formatNumber(
      ph.recovered
    )}</strong></p>
    </div>
  `;

  overviewContainer.innerHTML = overviewHTML;
};

/***** SEARCH *****/
// event listener
openSearch.addEventListener('click', () => {
  searchForm.style.display = 'flex';
  searchTitle.textContent = 'Search Country';
});

searchButton.addEventListener('click', search);

// function
function search(e) {
  // prevent submitting
  e.preventDefault();
  let query = searchInput.value;
  if (query == '') return;
  // function call
  searchQuery(query);
  searchInput.value = '';
}

async function searchQuery(query) {
  const data = await fetch(
    `https://disease.sh/v3/covid-19/countries/${query}`
  ).then((res) => res.json());

  const searchHTML = `
      <div class="searchSummary">
        <h3>${data.country}</h3>
        <p><span>Population: </span><strong>${formatNumber(
          data.population
        )}</strong></p>
        <p><span>Tested: </span><strong>${formatNumber(data.tests)}</strong></p>
        <p><span>Active Cases: </span><strong>${formatNumber(
          data.active
        )}</strong></p>
        <p><span>Critical: </span><strong>${formatNumber(
          data.critical
        )}</strong></p>
        <p><span>Total Cases: </span><strong>${formatNumber(
          data.cases
        )}</strong></p>
        <p><span>Total Deaths: </span><strong>${formatNumber(
          data.deaths
        )}</strong></p>
        <p><span>Total Recovered: </span><strong>${formatNumber(
          data.recovered
        )}</strong></p>
      </div>
    `;

  if (data.message) {
    searchContainer.innerHTML = `
      <div class="error">
      <p>${data.message}</p>
      </div>`;
  } else {
    searchContainer.innerHTML = searchHTML;
  }
}

/************************* FUNCTION CALL *************************/
callApi();
