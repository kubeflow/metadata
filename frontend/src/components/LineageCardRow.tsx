import * as React from 'react';
import './LineageCardRow.css';
import {
  Artifact,
} from "../generated/src/apis/metadata/metadata_store_pb";
import {LineageResource} from "./LineageTypes";
import {
 getResourceDescription, getResourceName,
} from "../lib/Utils";

interface LineageCardRowProps {
  leftAffordance: boolean;
  rightAffordance: boolean;
  hideRadio: boolean;
  isLastRow: boolean;
  resource: LineageResource
  setLineageViewTarget?(artifact: Artifact): void
}

export class LineageCardRow extends React.Component<LineageCardRowProps> {
  constructor(props: LineageCardRowProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  public checkEdgeAffordances(): JSX.Element[] {
    const affItems = [];
    this.props.leftAffordance && affItems.push(<div className='edgeLeft' key={'edgeLeft'} />);
    this.props.rightAffordance && affItems.push(<div className='edgeRight' key={'edgeRight'} />);
    return affItems;
  }

  public render(): JSX.Element {
    const {isLastRow} = this.props;

    return (
      <div className={`cardRow ${isLastRow?'lastRow':''}`}>
        {this.checkRadio()}
        <footer>
          <p className='rowTitle'>{getResourceName(this.props.resource)}</p>
          <p className='rowDesc'>{getResourceDescription(this.props.resource)}</p>
        </footer>
        {this.checkEdgeAffordances()}
      </div>
    );
  }

  private checkRadio(): JSX.Element {
    if (!this.props.hideRadio) {
      return <div><input type='radio' className='form-radio' name='' value='' onClick={this.handleClick} /></div>;
    }
    return <div className='noRadio' />;
  }

  private handleClick() {
    if (!this.props.setLineageViewTarget || !(this.props.resource instanceof Artifact)) return;
    this.props.setLineageViewTarget(this.props.resource);
  }
}
