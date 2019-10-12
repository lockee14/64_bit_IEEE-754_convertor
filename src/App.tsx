import React from 'react';
import './App.css';

/*
 * problem de conversion avec bintonum or numtobin (propably numtobin)
 * number 1 as a wrong binary value
 * number 0 should be full 0 in binary
 * avant de continué et pour le pas faire de la merde
 * voir la donc concernant IEEE754
 * comprendre biais et denormalized number
 * reflechi a faire proprement chacun des fonction qui convertisse num to bin et bin to num
 * zero (0) est un nombre denormalizé thus every bit = 0
 * problem avec les nombre de 0.quelquechose
 * exemple 0.15: int: 00000000..., dec: 001010000.... donc expo = 2^-3 >> 01111111100
 * mantissa = 01000000.... because implicite leading one thus 001010000... become 1.01000... * 2^-3
 * 
 */


function Input(props: any) {
  const atr: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> = {
    maxLength: 1,
    minLength: 1,
    size: 1,
    value: props.bit === " " ? "" : props.bit,
    id: `bit${props.index}`,
    name: `${props.index}`,
    className: props.index > 11 ? "inputMantissa" : props.index === 0 ? "inputSign" : "inputExponent",
  };
  return (
    <input key={props.index} type="text" required {...atr} onChange={event => props.newBit(event)}></input>
  )
}

class App extends React.Component<{}, {number: string, binary: string}> {
  constructor(props: any) {
    super(props)
    this.state = {
      number: "0.15",
      binary: "",
    };
  }

  number: string = "";
  binary: string = "";

  binSign: string = "";
  binInt: string = "";
  binDec: string = "";

  integer: string= "";
  decimal: string = "";

  exponent: string = "";
  biaisExp: string = "";
  mantissa: string = "";

  denormalized: boolean = false;


  convert() { // tres mal organisé, mal foutu
    let templateBin, templateDec, templateMan;
    [this.number, this.binary] = [this.state.number, this.state.binary];
    if (this.binary !== "" && this.binary.indexOf("1") !== -1/*!regex.test(this.binary)*/) {
      [this.number, this.exponent, this.mantissa] = binToNum(this.binary);
      [ , this.binSign, this.binInt, this.binDec, this.integer, this.decimal, templateBin, templateDec, templateMan] = numToBin(this.number);
    } else /*if (this.number !== "" && this.number !== "0")*/ {
      console.log("number: ", this.number);
      this.number = this.number === "" ? "0" : this.number;
      [this.binary, this.binSign, this.binInt, this.binDec, this.integer, this.decimal, templateBin, templateDec, templateMan] = numToBin(this.number);
      [ , this.exponent, this.mantissa] = binToNum(this.binary);
    } /*else {
      this.number = "0";
      [ this.binary, this.binSign, this.binInt, this.binDec, this.integer, this.decimal, templateBin, templateDec, templateMan] = numToBin(this.number);
      [ , this.exponent, this.mantissa] = binToNum(this.binary);      
    }*/
    return [templateBin, templateDec, templateMan]
  }

  render() {
    [this.number, this.binary, this.binSign, this.binInt, this.binDec, this.integer, this.decimal, this.exponent, this.mantissa] = ["", "", "", "", "", "" ,"" ,"" ,""];
    let [templateBin, templateDec, templateMan] = this.convert();
    console.log(
      "this.number: ", this.number,
      "this.binary: ", this.binary, this.binary.length,
      "this.binSign: ", this.binSign,
      "this.binInt: ", this.binInt,
      "this.binDec: ", this.binDec,
      "this.exponent: ", this.exponent,
      "this.mantissa: ", this.mantissa,
    )
    return (
      <div>
        <h1>64 bit IEEE-754 floating point format</h1>
        {/* <p>TODO: </p>
        <p>improve UI, don't forget edge case</p>
        <p>ne pas oublier les cas speciaux 0, null, infinity, denormalized number >> voir doc</p> */}
        <div id="bits">
          {this.displayBinary()}
        </div>
        <div id="explain">
          <div id="toNum">
            <h3>Bits to number conversion:</h3>
            <div>{this.explainToNum({})}</div>
          </div>
          <div id="toBits">
            <h3>Number to bits conversion:</h3>
            <div>{this.explainToBits({templateBin, templateDec, templateMan})}</div>
          </div>
        </div>
        <div id="number">
          <input id="numberInput" type="text" value={this.number} onChange={event => this.newNumber(event)}></input>
        </div>
      </div>
    );
  }

  newBit(event: React.ChangeEvent<HTMLInputElement>) { // simplify
    const index = ~~event.target.name;
    const value = event.target.value;
    // let newBin = "";
    const newBin = this.binary.split('');
    newBin[index] = value === "1" || value === "0" ? value : newBin[index];
    // let right = "";//this.binary.slice(0, ~~index);
    // let left = "";//this.binary.slice(~~index + 1, this.binary.length);
    // if(index === '0') {
    //   right = this.binary.slice(1, this.binary.length)
    // } else if(index === '63') {
    //   left = this.binary.slice(0, this.binary.length - 1)
    // } else {
    //   left = this.binary.slice(0, ~~index);
    //   right = this.binary.slice(~~index + 1, this.binary.length);
    // }
    // if(event.target.value === '1' || event.target.value === '0') {
    //   newBin = left + event.target.value + right;
    // } else {
    //   newBin = this.binary;
    // }
    this.setState({
      number: "",
      binary: newBin.join(''),
    })
  }

  newNumber(event: React.ChangeEvent<HTMLInputElement>) {
    const regex = new RegExp('^-{0,1}[0-9]+(\\.{0,1}[0-9]+$|$)');
    let number = regex.test(event.target.value) ? event.target.value : this.number;
    this.setState({
      number: number,
      binary: ""
    });
  }

  displayBinary() {
    const temp = [];
    for(let i = 0; i < this.binary.length; i++) {
      temp.push(Input({index: i, bit: this.binary[i], newBit: this.newBit.bind(this)}));      
    }
    return temp;
  }

  explainToNum(props: any) {
    const binSign = this.binary.slice(0, 1);
    const binExponent = this.binary.slice(1, 12);
    const binMantissa = this.binary.slice(12);
    
    let exponent = 0;
    let explainExp: JSX.Element[] = [];
    binExponent.split('').forEach((bit, i) => {
      explainExp.push(
        <span key={i}> {i === 0 ? "" : "+"} {bit} * 2<sup className="exponent">{10-i}</sup></span>
      )
      exponent += ~~bit * Math.pow(2, 10-i);
    });
    explainExp = explainExp.slice(0, 3)
      .concat([<span> .</span>, <span> .</span>, <span> .</span>, <span> .</span>])
      .concat(explainExp.slice(8));
    const displayBinMan: JSX.Element[] = [];
    const explainMan: JSX.Element[] = [];
    let mantissa = 1;
    for(let i = 0; i < binMantissa.length; i++) {
      if(!(i % 4)) {
        displayBinMan.push(
          <span key={i} className="mantissa">{binMantissa.slice(i, i+4)}</span>
        )
      }
      if(i<3) {
        explainMan.push(
          <span key={i}>{binMantissa[i]} * 2<sup className="mantissa">-{i+1}</sup> + </span>
        )
      }
      mantissa += ~~binMantissa[i] * Math.pow(2, -(i+1));
    }

    explainMan.push(<span>.</span>, <span>.</span>, <span>.</span>, <span>.</span>, <span> + </span>,
    <span key={50}>{binMantissa[50]} * 2<sup className="mantissa">-{51}</sup> + </span>,
    <span key={51}>{binMantissa[51]} * 2<sup className="mantissa">-{52}</sup> + </span>);

    return(
      <div className="displayResult">
        <div>
          <span>
            sign bit: 
            <span className="sign">{" " + binSign + " "}</span>
            thus the number is {binSign === "0" ? "positive": binSign === "1" ? "negative" : "unknow"}
          </span>
        </div>
        <div>
          <p>binary exponent: <span className="binExponent exponent">{binExponent}</span></p>
          <p>{explainExp} = {exponent}</p>
          <p>exponent = {exponent} - 1023 (biais) = <span className="exponent">{exponent - 1023}</span></p>
        </div>
        <div>
          <p>mantissa: <span id="binMantissa">{displayBinMan}</span></p>
          <p>1 + {explainMan} = <span className="mantissa">{mantissa}</span></p>
        </div>
        <div>
          <p>formula:
            <span> -1<sup className="sign">sign</sup> * 2<sup>
              <span className="exponent">exp</span> - biais</sup> * <span className="mantissa">mantissa</span> = number
            </span>
          </p>
          <p>number = -1
            <sup className="sign">{binSign}</sup> * 2
            <sup className="exponent">{exponent - 1023}</sup> * <span className="mantissa">{mantissa}</span> = {this.number}
          </p>
        </div>
      </div>
    )
  }

  explainToBits(props: any) {
    const number = this.number;
    console.log("explainToBits scientifi notation: ")
    console.log("binDec: ", this.binDec);
    console.log("this.binDec.slice(this.binDec.indexOf(1))[0]: ", this.binDec.slice(this.binDec.indexOf("1"))[0])
    console.log("this.binDec.slice(this.binDec.indexOf(1) + 1): ", this.binDec.slice(this.binDec.indexOf("1") + 1))
    return(
      <div>
        <h4>Number: {number}</h4>
        <div id="compute">
          <div>
            <h4>integer: {this.integer}</h4>
            <div className="computeCont">
              <div id="intCompute">{props.templateBin}</div>
              {this.integer !== "0" ? 
                <span>
                  <span className="arrow arrowUp"></span>
                  <span className="line"></span>
                </span>
                : 
                <span></span>
              }
            </div>
          </div>
          <div>
            <h4>decimal: 0.{this.decimal ? this.decimal : "0"}</h4>
            <div className="computeCont">
              <div id="decCompute">{props.templateDec}</div>
              <span>
                <span className="line"></span>
                <span className="arrow arrowDown"></span>                                
              </span>
            </div>
          </div>
        </div>
        <div className="displayResult">
          <p>binary integer: <span className="displayBin mantissa">{this.binInt === "" ? "0" : this.binInt}</span></p>
          <p>binary decimal: <span className="displayBin mantissa">{this.binDec}</span></p>
          <p>result: {props.templateMan}</p>
          <p>scientific notation:
             {this.binInt.length ? 
               <span className="displayBin">
                 {" " + this.binInt.slice(0, 1)}.
                 <span className="mantissa">
                   {this.binInt.slice(1).concat(this.binDec).slice(0,30)}{/*this.binDec.slice(0, 25)*/}....
                 </span>
                 {" * 2"}
                 <sup className="exponent">{this.exponent}</sup>
                </span>
               :
               <span className="displayBin">
                 {" " + this.binDec.slice(this.binDec.indexOf("1"))[0]}.
                 {/* {this.binDec.indexOf("1") === -1 ? " 0" : " 1"}. */}
                 <span className="mantissa">
                   {this.binDec.slice(this.binDec.indexOf("1") + 1).slice(0, 30)}....
                   {/* {this.binDec} */}
                 </span>
                 {" * 2"}
                 <sup className="exponent">{this.exponent}</sup>
                </span>
             }
          </p>
          <p>exponent: {this.exponent} + 1023 (biais) = <span className="binExponent exponent">{this.binary.slice(1,12)}</span></p>
          <p>{this.binSign === "1" ? "negative":"positive"} number sign bit = <span className="sign">{this.binSign}</span></p>
          <p>binary: 
            <span className="displayBin">
              <span className="sign"> {this.binary.slice(0,1)}</span>
              <span className="exponent">{this.binary.slice(1,12)}</span>
              <span className="mantissa">{this.binary.slice(12)}</span>
            </span>
          </p>
        </div>
      </div>
    )
  }

}

function binToNum(binary: string): any[] {
  let sign = binary[0];

  let exponent = binary.slice(1, 12).split('').reverse()
  .reduce((acc, cur, i) => acc += cur === "1" ? Math.pow(2, i) : 0, 0) - 1023;
  
  let mantissa = binary.slice(12, binary.length).split('')
  .reduce((acc, cur, i) => acc += cur === "1" ? Math.pow(2, -(i+1)) : 0, 1);
  
  return sign === "0" ? 
    [`${Math.pow(2, exponent) * mantissa}`, exponent, mantissa] :
    [`-${Math.pow(2, exponent) * mantissa}`, exponent, mantissa];
}

function numToBin(number: string): any[] {
  const arr = number[0] === "-" ? number.slice(1).split('.') : number.split('.');
  const int = parseInt(arr[0], 10);
  const dec = parseFloat("0." + arr[1]);
  
  const binSign = number[0] === "-" ? "1" : "0";
  const [binInt, templateBin] = intToBin(int);
  let [binDec, templateDec] = decToInt(dec);
  console.log("number to bin decimal: ", binDec);
  templateDec.push(<p className="mantissa">.</p>, <p className="mantissa">.</p>, <p className="mantissa">.</p>)
  

  let [exponent, templateMan] = number === "0" ? 
    [0, <span className="displayBin"><span className="mantissa">{binDec.join('')}</span></span>]
    : findExponent(binInt, binDec);

  // binDec = binInt.length ? binDec : binDec.slice(binDec.findIndex((x) => x === "1") + 1);
  console.log("binDec deja slice: ", binDec)

  const binExp = new Array(11).fill("0").map((x, i) => {
    if(exponent >= Math.pow(2, 10 - i)) {
      x = "1";
      exponent -= Math.pow(2, 10 - i);
    }
    return x;
  })
  let adjustedBinDec = binInt.length ? binDec : binDec.slice(binDec.findIndex((x) => x === "1") + 1);
  let bitNum = [binSign].concat(binExp).concat(binInt.slice(1).concat(adjustedBinDec));
  if(bitNum.length < 64) {
    const fill = 64 - bitNum.length;
    for(let i = 0; i <= fill; i++) {
      bitNum.push('0');
    } 
  } else if(bitNum.length > 64) {
    bitNum = bitNum.slice(0, 64);
  }

  return [bitNum.join(''), binSign, binInt.join(''), binDec.join(''), arr[0], arr[1], templateBin, templateDec, templateMan];
}

function intToBin(int: number): [string[], JSX.Element[]] {
  const arr: string[] = [];
  let template: JSX.Element[] = [];
  while(int) {
    let [nextInt, rest] = [Math.floor(int/2), int%2];
    template.push(<p>{int} = {nextInt} * 2 + <span className="mantissa">{rest}</span></p>);
    arr.push(`${rest}`);
    int = Math.floor(nextInt);
  }

  template = template.length >= 13 ? 
      template.slice(0, 4).concat(
        [<p className="mantissa">.</p>, <p className="mantissa">.</p>, <p className="mantissa">.</p>]
      ).concat(template.slice(template.length -5, template.length))
      : template;
  
  return [arr.reverse(), template];
}

function decToInt(dec: number): [string[], JSX.Element[]] {
  const arr = [];
  const template = [];
  for(let i = 0; i <= 52; i++) {
    const newDec = dec * 2;
    const bit = newDec >= 1 ? 1: 0;
    if(i < 9) {
      template.push(<p>{`${dec}`.slice(0, 5)} * 2 = <span className="mantissa">{bit}</span>{`${newDec}`.slice(1, 5)}</p>)
    }
    arr.push(`${bit}`);
    dec = bit ? parseFloat('0' + `${newDec}`.slice(1, 5)) : newDec;
  }
  return [arr, template];
}

function findExponent(binInt: string[], binDec: string[]): [number, JSX.Element] {
  let templateMan;
  let exponent;

  if(binInt.length >= 1) {
    exponent = binInt.length - 1;
    templateMan = 
      <span className="displayBin">
        {binInt[0]}
        <span className="showExp mantissa">{binInt.slice(1).join('')}</span>
        <span className="showExp">.</span>
        <span>{binDec ? <span className="mantissa">{binDec.join('')}</span> : <span></span>}</span>
      </span>;
  } else {
    exponent = binDec.findIndex((x) => x === "1") + 1;
    templateMan = 
      <span>
        0.
        <span className="showExp mantissa">{binDec.slice(0, exponent).join('')}</span>
        <span className="mantissa">{binDec.slice(exponent).join('')}</span>
      </span>;
    exponent = -exponent;
  }
  exponent += 1023;
  return [exponent, templateMan];
}

export default App;
