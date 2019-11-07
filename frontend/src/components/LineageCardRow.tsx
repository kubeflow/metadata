// tslint:disable: no-unused-expression
import React from 'react';
import './LineageCardRow.css';

interface LineageCardRowProps {
  title: string;
  description?: string;
  leftAffordance: boolean;
  rightAffordance: boolean;
  hideRadio: boolean;
  isLastRow: boolean;
}

export class LineageCardRow extends React.Component<LineageCardRowProps> {
  public checkEdgeAfforances(): JSX.Element[] {
    const affItems = [];
    this.props.leftAffordance && affItems.push(<div className='edgeLeft' />);
    this.props.rightAffordance && affItems.push(<div className='edgeRight' />);
    return affItems;
  }
  public render(): JSX.Element {
    const {title, description, isLastRow} = this.props;
    return (
      <div className={`cardRow ${isLastRow?'lastRow':''}`}>
        {this.checkRadio()}
        <footer>
          <p className='rowTitle'>{title}</p>
          <p className='rowDesc'>{description}</p>
        </footer>
        {this.checkEdgeAfforances()}
      </div>
    );
  }
  private checkRadio(): JSX.Element {
    if (!this.props.hideRadio) {
      return <div><input type='radio' className='form-radio' name='' value='' /></div>;
    }
    return <div className='noRadio' />;
  }
}