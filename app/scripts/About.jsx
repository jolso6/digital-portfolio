export default class AboutComponent extends React.Component {
  constructor(props) {
    super(props);

    this.sentences = [
      "I am fascinated by the notion that",
      "perception is the root of deception.",
      "I find that sometimes we lose track of",
      "who we are and what we stand for;",
      "my work serves as a humble reminder that",
      "we are all interconnected."
    ];

    this.state = {sentences: []};
  }

  updateSentences(i) {
    if (i > this.sentences.length) {
      return;
    }

    let sents = _.take(this.sentences, i);
    this.setState({sentences: sents});

    setTimeout(() => { return this.updateSentences(i + 1); }, 1500);
  }

  componentDidMount() {
    this.updateSentences(0);
  }

  render() {
    return (
      <div className="about">
        <br />
        <br />
        { this.state.sentences.map((s, i) => { return <Sentence key={i} content={s} id={i} />; }) }
      </div>
    );
  }
}

class Sentence extends React.Component {
  render() {
    return (
      <p id={"sentence" + this.props.id}>{this.props.content}</p>
    );
  }
}
