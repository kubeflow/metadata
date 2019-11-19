import * as React from 'react';
import './LineageCardRow.css';
import {
  Artifact,
  Value
} from "../generated/src/apis/metadata/metadata_store_pb";
import {ArtifactProperties} from "../lib/Api";

export interface LineageCardRowProps {
  title: string;
  description?: string;
  leftAffordance: boolean;
  rightAffordance: boolean;
  hideRadio: boolean;
  isLastRow: boolean;
  onArtifactCardClicked?(artifact: Artifact): void
}

export class LineageCardRow extends React.Component<LineageCardRowProps> {
  constructor(props: LineageCardRowProps) {
    super(props);
    this.logClick = this.logClick.bind(this);
  }

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
      return <div><input type='radio' className='form-radio' name='' value='' onClick={this.logClick} /></div>;
    }
    return <div className='noRadio' />;
  }

  private logClick() {
    if (this.props.onArtifactCardClicked) {
      // TODO: Remove once this class has an Artifact in its props.
      const mockArtifact = new Artifact();
      const nameValue = new Value();
      nameValue.setStringValue(this.props.title);
      mockArtifact.getPropertiesMap().set(ArtifactProperties.NAME, nameValue);
      this.props.onArtifactCardClicked(mockArtifact);
    }
  }
}