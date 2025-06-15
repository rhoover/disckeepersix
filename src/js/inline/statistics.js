(() => {
  'use strict';

  // grab DOM elements
  let mainElement = document.querySelector('.statistics');
  let courseItemsSection = document.querySelector('.courses');
  let noRounds = document.querySelector('.courses-wait');

  // course data modal
  let courseDiv = document.querySelector('.course');
  let courseDivHeader = document.querySelector('.course-header');
  let courseDivChart = document.querySelector('.course-chart');
  let closeCourseModal = document.querySelector('.course-close');

  // holes data modal
  let holesDiv = document.querySelector('.holes');
  let holesDivHeader = document.querySelector('.holes-header');
  let holesDivChart = document.querySelector('.holes-chart');
  let closeHolesModal = document.querySelector('.holes-close');

  // initialize
  let roundsData = [];
  let warningOutput = "";
  let deduped;
  let chosenCourseID = '';
  let buttonChoice = '';
  let courseRounds = [];
  let chosenCourseName = '';
  let overAllScore = [];
  let minMaxAvgScore = [];
  let playerScoring = [];
  let holeThrowsArray;
  let minMaxAvgHole = [];
  let holeIDArray = [];
  let holeChartData = [];
  let insideNewData = [];
  let bestScore = null;
  let worstScore = null;
  let averageScore = null;
  let baseURL;

  // development vs production URL
  switch (window.location.hostname) {
    case 'localhost':
      baseURL = 'http://localhost:3000'
    break;
    case 'disckeeper.io':
      baseURL = 'https://disckeeper.io:3000'
    break;
    default:
    break;
  };

  let stats = {

    init() {
      
      localforage.getItem('discIDB')
        .then((idbData) => {
          let primaryPlayerObject = idbData;
          primaryPlayerObject["belongsTo"] = idbData._id;

          stats.getRounds(primaryPlayerObject);
        });
      }, // end init

    getRounds(primary) {

    fetch(`${baseURL}/api/existingrounds?ownerID=${primary.belongsTo}`)
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.length == 0) {

          noRounds.innerHTML += `
            <p class="warning">You don't have any rounds saved yet,</p>
            <a href="/roundsetup.html" class="warning-link">Go ahead and start one!  ➤</a>
          `;
          
        } else {
        stats.buildDOMList(data);
        };
      });
    }, // end getRounds

    buildDOMList(roundsData) {

      // remove duplicates for on-screen display
      deduped = roundsData.filter((obj, index) => {
        return index === roundsData.findIndex(o => obj.courseID === o.courseID);
      });

      // get number of each course from rounds array
      function countCourses(arr, property) {
        return arr.reduce((counts, obj) => {
        const value = obj[property];
        counts[value] = (counts[value] || 0) + 1;
        return counts;
        }, {});
      };
      let courseCounts = countCourses(roundsData, 'courseName');

      // then present card on-screen
      courseItemsSection.innerHTML = '';
      deduped.forEach((round) => {
        courseItemsSection.innerHTML += `
          <div class="course-card">
            <p class="course-card-name">${round.courseName}</p>
            <p class="course-card-count"></p>
            <button class="course-card-button" choice="course" courseid="${round.courseID}">Course Stats</button>
            <button class="course-card-button" choice="holes" courseid="${round.courseID}">Hole Stats</button>
          </div>
        `;
      });

      // now inject number of rounds played for each course into appropriate card
      let cardElement = courseItemsSection.querySelectorAll('.course-card');

      cardElement.forEach((element) => {
        let cardCourseName = element.querySelector('.course-card-name').textContent;
        let numbersElement = element.querySelector('.course-card-count');
        for (const key in courseCounts) {
          if (key === cardCourseName) {
            let numberOfCourses = courseCounts[key];
            numbersElement.textContent = `Number of Rounds: ${numberOfCourses}`;
          }
        };
      });

      stats.manageDOMList(roundsData);
    }, // end buildDOMList

    manageDOMList(roundsData) {


      courseItemsSection.addEventListener('click', (event) => {

        // which button was clicked and collect data
        buttonChoice = event.target.closest('.course-card-button').getAttribute('choice');
        chosenCourseID = event.target.closest('.course-card-button').getAttribute('courseid');

        // get the appropriate rounds
        courseRounds = roundsData.filter((round) => {return round.courseID == chosenCourseID});

        switch (buttonChoice) {
          case 'course':
            stats.buildCourseData(courseRounds);            
          break;
          case 'holes':
            stats.buildHoleData(courseRounds);            
          break;
        
          default:
            break;
        };
      });      
    }, // end manageDOMList

    buildCourseData(courseRounds) {
      console.log(courseRounds);

      // set course name for modal
      chosenCourseName = courseRounds[0].courseName;

      for (let i = 0; i < courseRounds.length; i++) {
        // for now, there's only one player
        overAllScore.push(courseRounds[i].finalScore);
      };
      console.log('overall:', overAllScore.length);

      // build the min-max-avg for the overall course score
      bestScore = Math.min(...overAllScore);
      worstScore = Math.max(...overAllScore);
      averageScore = overAllScore.reduce((a,b) => a + b) / overAllScore.length;
      // round down to nearest integer
      let gridAverageScore = Math.floor(Number(averageScore));
      // restrict to one decimal place
      // let realAverageScore = parseFloat(averageScore.toFixed(1));
      let realAverageScore = parseFloat(gridAverageScore.toFixed(1));
      
      // minMaxAvgScore.push({minimum: bestScore, maximum: worstScore, gridaverage: gridAverageScore, realavg: realAverageScore});
      minMaxAvgScore.push(bestScore, worstScore, realAverageScore);

      stats.buildCourseGraph(chosenCourseName, minMaxAvgScore);
    }, // end buildCourseData

    buildCourseGraph(course, scores) {

      // these need to be re-set in case you want to look at another course
      overAllScore = [];
      minMaxAvgScore = [];

      courseDiv.showModal();

      courseDivHeader.innerHTML = `<p class="course-header-text">${course}</p><p>Overall Course Performance</p>`;
      let chartDOM = document.getElementById('course-chart');

      let myChart = echarts.init(chartDOM, null, {
        renderer: 'svg',
        useDirtyRect: false
      });
      let option;

      option = {
        title: {
          text: `Best, Worst, Average Scores`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          top: 80,
          bottom: 30
        },
        xAxis: {
          type: 'value',
          position: 'top',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          },
          axisLine: {
            lineStyle: {
              color:'#555557',
              width: 2
            }
          }
        },
        yAxis: {
          type: 'category',
          axisLine: { show: false },
          axisLabel: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          data: ['Best', 'Worst', 'Average']
        },
        series: [
          {
            type: 'bar',
            stack: 'Total',
            label: {
              show: true,
              formatter: '{b}',
              position: 'inside',
              fontSize: 24
            },
            data: scores,
            itemStyle: {
              color: '#EAEBF0',
              barBorderRadius: 5,
              borderWidth: 1,
              borderType: 'solid',
              borderColor: '#6B729E'
            } 
          }
        ],
      };

      if (option && typeof option === 'object') {
        myChart.setOption(option);
      };

    closeCourseModal.addEventListener('click', (event) => {

      courseDiv.close();

    }); // end addEventListener()

    }, //end buildCourseGraph

    buildHoleData(courseRounds) {

      // clean out first before starting the data manipulation below
      minMaxAvgHole = [];
      holeChartData = [];
      holeIDArray = [];
      playerScoring = [];
      holeThrowsArray = [];

      // setting to be length of course
      holeThrowsArray = Array(courseRounds[0].holes.length).fill(0).map(() => []);

      chosenCourseName = courseRounds[0].courseName;

      for (let i = 0; i < courseRounds.length; i++) {
        playerScoring.push(courseRounds[i].holes);
      };

      for (let i = 0; i < playerScoring.length; i++) {
        for (let j = 0; j < holeThrowsArray.length; j++) {
          holeThrowsArray[j].push(playerScoring[i][j].holeThrows);
        };
      };

      // build the min-max-avg for each hole
      for (let i = 0; i < holeThrowsArray.length; i++) {
        // first the math
        let minNumber = Math.min(...holeThrowsArray[i]);
        let maxNumber = Math.max(...holeThrowsArray[i]);
        let avgNumber = holeThrowsArray[i].reduce((a,b) => a + b) / holeThrowsArray[i].length;
        // round down to nearest integer, i.e. no decimals
        let gridAvgNumber = Math.floor(Number(avgNumber));
        // restrict to one decimal place
        // let realAvg = parseFloat(gridAvgNumber.toFixed(1));
        // hole number as string
        let hn = i + 1;
        let holeNumber = 'Hole ' + hn.toString();

        minMaxAvgHole.push({hole: holeNumber, minimum: minNumber, maximum: maxNumber, realavg: gridAvgNumber});
      };

      // need to get the holePar into minMaxAvgHole for display purposes
      for (let i = 0; i < playerScoring.length; i++) {
        for (let j = 0; j < minMaxAvgHole.length; j++) {
          minMaxAvgHole[j].par = playerScoring[i][j].holePar;
        };
      };
      
      // console.log('minMaxAvgHole1:', minMaxAvgHole);
      stats.buildHoleGraph(chosenCourseName, minMaxAvgHole);
    }, // end buildHoleData

    buildHoleGraph(chosenCourseName, minMaxAvgHole) {

      holesDiv.showModal();

      holesDivHeader.innerHTML = `<p class="holes-header-text">${chosenCourseName}</p><p>Hole-By-Hole</p>`;

      // create a div for each hole to hold its own chart
      minMaxAvgHole.forEach((hole, index) => {

        // create the hole id selector for echarts to grab
        let holeID = `hole${index + 1}`;
        holeIDArray.push(holeID);

        holesDivChart.innerHTML += `
          <div class="holes-chart-hole">
            <h4 class="holes-chart-hole-name">
              ${hole.hole} 
              <span class="holes-chart-hole-name-par">Par: ${hole.par}</span>
            </h4>
            <div id=${holeID} style="height: 30vh"></div>
          </div>
        `;
      }); // end forEach()
      // console.log('length:', minMaxAvgHole.length, holeChartData.length);

      // new array to play nice with echarts, just three numbers in an array inside an array
      for (let i = 0; i < minMaxAvgHole.length; i++) {
        let insideNewData = [];
        insideNewData.push(minMaxAvgHole[i].minimum, minMaxAvgHole[i].maximum, minMaxAvgHole[i].realavg);
        holeChartData.push(insideNewData);
      };

      // lets build the charts for each hole
      for (let i = 0; i < holeIDArray.length; i++) {
        let chartDiv = document.getElementById(holeIDArray[i]);

        let holeChart = echarts.init(chartDiv, null, {renderer: 'svg', useDirtyRect: false});
        let option;

        option = {
          title: {
            text: `Best, Worst, Average Scores`,
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            top: 80,
            bottom: 30
          },
          xAxis: {
            type: 'value',
            position: 'top',
            splitLine: {
              lineStyle: {
                type: 'solid'
              }
            },
            axisLine: {
              lineStyle: {
                opacity: 1,
                type: 'solid',
                color:'#555557',
                width: 2
              }
            }
          },
          yAxis: {
            type: 'category',
            axisLine: { show: false },
            axisLabel: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            data: ['Best', 'Worst', 'Average']
          },
          series: [
            {
              type: 'bar',
              stack: 'Total',
              label: {
                show: true,
                formatter: '{b}',
                position: 'inside',
                fontSize: 24
              },
              data: holeChartData[i],
              itemStyle: {
                color: '#EAEBF0',
                barBorderRadius: 5,
                borderWidth: 1,
                borderType: 'solid',
                borderColor: '#6B729E'
              } 
            }
          ],
        }; // end option
        
        if (option && typeof option === 'object') {
          holeChart.setOption(option);
        };
      }; // end for loop of charts

      closeHolesModal.addEventListener('click', (event) => {

        holesDiv.close();

        holesDivChart.innerHTML = '';
      
      }); // end addEventListener()
      
    }, //end buildHoleGraph
  };

  stats.init();
})();