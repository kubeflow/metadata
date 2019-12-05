import * as React from 'react';
import './LineageCardRow.css';
import {Artifact} from "../generated/src/apis/metadata/metadata_store_pb";

interface LineageCardRowProps {
  title: string;
  description?: string;
  leftAffordance: boolean;
  rightAffordance: boolean;
  hideRadio: boolean;
  isLastRow: boolean;
  artifact?: Artifact;
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
    const {title, description, isLastRow} = this.props;
    return (
      <div className={`cardRow ${isLastRow?'lastRow':''}`}>
        {this.checkRadio()}
        <footer>
          <p className='rowTitle'>{title}</p>
          <p className='rowDesc'>{description}</p>
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
    if (!this.props.setLineageViewTarget || !this.props.artifact) return;
    this.props.setLineageViewTarget(this.props.artifact);
  }
}
