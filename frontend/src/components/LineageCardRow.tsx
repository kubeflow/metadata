import * as React from 'react';
import './LineageCardRow.css';
import {
  Artifact,
  Value
} from "../generated/src/apis/metadata/metadata_store_pb";
import {ArtifactProperties} from "../lib/Api";

interface LineageCardRowProps {
  title: string;
  description?: string;
  leftAffordance: boolean;
  rightAffordance: boolean;
  hideRadio: boolean;
  isLastRow: boolean;
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

  private get artifact(): Artifact {
    // TODO: Return this.props.artifact once available.
    const mockArtifact = new Artifact();
    const nameValue = new Value();
    nameValue.setStringValue(this.props.title);
    mockArtifact.getPropertiesMap().set(ArtifactProperties.NAME, nameValue);
    return mockArtifact
  }

  private handleClick() {
    if (!this.props.setLineageViewTarget) return;
    this.props.setLineageViewTarget(this.artifact);
  }
}
