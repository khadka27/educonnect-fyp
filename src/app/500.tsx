// pages/500.tsx
export default function Custom500() {
    return (
        <div className="container">
            <h1>500</h1>
            <h2>Unexpected Error <b>:(</b></h2>
            <div className="gears">
                <div className="gear one">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
                <div className="gear two">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
                <div className="gear three">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
            </div>
            <style jsx>{`
          :root {
            --main-color: #eaeaea;
            --stroke-color: black;
          }
  
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: var(--main-color);
          }
  
          h1 {
            margin: 100px auto 0 auto;
            color: var(--stroke-color);
            font-family: 'Encode Sans Semi Condensed', Verdana, sans-serif;
            font-size: 10rem;
            line-height: 10rem;
            font-weight: 200;
            text-align: center;
          }
  
          h2 {
            margin: 20px auto 30px auto;
            font-family: 'Encode Sans Semi Condensed', Verdana, sans-serif;
            font-size: 1.5rem;
            font-weight: 200;
            text-align: center;
          }
  
          h1, h2 {
            transition: opacity 0.5s linear, margin-top 0.5s linear;
          }
  
          .loading h1, .loading h2 {
            margin-top: 0px;
            opacity: 0;
          }
  
          .gears {
            position: relative;
            margin: 0 auto;
            width: auto;
            height: 0;
          }
  
          .gear {
            position: relative;
            z-index: 0;
            width: 120px;
            height: 120px;
            margin: 0 auto;
            border-radius: 50%;
            background: var(--stroke-color);
          }
  
          .gear:before {
            position: absolute;
            left: 5px;
            top: 5px;
            right: 5px;
            bottom: 5px;
            z-index: 2;
            content: "";
            border-radius: 50%;
            background: var(--main-color);
          }
  
          .gear:after {
            position: absolute;
            left: 25px;
            top: 25px;
            z-index: 3;
            content: "";
            width: 70px;
            height: 70px;
            border-radius: 50%;
            border: 5px solid var(--stroke-color);
            box-sizing: border-box;
            background: var(--main-color);
          }
  
          .gear.one {
            left: -130px;
          }
  
          .gear.two {
            top: -75px;
          }
  
          .gear.three {
            top: -235px;
            left: 130px;
          }
  
          .gear .bar {
            position: absolute;
            left: -15px;
            top: 50%;
            z-index: 0;
            width: 150px;
            height: 30px;
            margin-top: -15px;
            border-radius: 5px;
            background: var(--stroke-color);
          }
  
          .gear .bar:before {
            position: absolute;
            left: 5px;
            top: 5px;
            right: 5px;
            bottom: 5px;
            z-index: 1;
            content: "";
            border-radius: 2px;
            background: var(--main-color);
          }
  
          .gear .bar:nth-child(2) {
            transform: rotate(60deg);
          }
  
          .gear .bar:nth-child(3) {
            transform: rotate(120deg);
          }
  
          @keyframes clockwise {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
  
          @keyframes anticlockwise {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
  
          @keyframes clockwiseError {
            0% { transform: rotate(0deg); }
            20% { transform: rotate(30deg); }
            40% { transform: rotate(25deg); }
            60% { transform: rotate(30deg); }
            100% { transform: rotate(0deg); }
          }
  
          @keyframes anticlockwiseErrorStop {
            0% { transform: rotate(0deg); }
            20% { transform: rotate(-30deg); }
            60% { transform: rotate(-30deg); }
            100% { transform: rotate(0deg); }
          }
  
          @keyframes anticlockwiseError {
            0% { transform: rotate(0deg); }
            20% { transform: rotate(-30deg); }
            40% { transform: rotate(-25deg); }
            60% { transform: rotate(-30deg); }
            100% { transform: rotate(0deg); }
          }
  
          .gear.one {
            animation: anticlockwiseErrorStop 2s linear infinite;
          }
  
          .gear.two {
            animation: anticlockwiseError 2s linear infinite;
          }
  
          .gear.three {
            animation: clockwiseError 2s linear infinite;
          }
  
          .loading .gear.one, .loading .gear.three {
            animation: clockwise 3s linear infinite;
          }
  
          .loading .gear.two {
            animation: anticlockwise 3s linear infinite;
          }
        `}</style>
        </div>
    );
}
