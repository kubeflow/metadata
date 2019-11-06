import React from "react";
import "./CardRow.css";

function CardRow(props) {

  const checkEdgeAfforances = () => {
    const affItems = [];
    if (props.leftAffordance) {
      affItems.push(<div className="edgeLeft"></div>);
    }
    if (props.rightAffordance) {
      affItems.push(<div className="edgeRight"></div>);
    }
    return affItems;
  };

  const checkLastRow = () => {
    if (props.lastRowState) return ("lastRow");
    else return ("");
  }

  const checkRadio = () => {
    if (!props.hideRadio) {
      return (
        <div>
          <input type="radio" className="form-radio" name="" value="" />
        </div>
      );
    }
    else {
      return (
        <div className="noRadio"></div>
      );
    }
  }

  return (
    <div className={`cardRow ${checkLastRow()}`}>
      {checkRadio()}
      <div>
        <p className="rowTitle">{props.artiName}</p>
        <p className="rowDesc">{props.artiDescription}</p>
      </div>
      {checkEdgeAfforances()}
    </div>
  );
}

export default CardRow;
