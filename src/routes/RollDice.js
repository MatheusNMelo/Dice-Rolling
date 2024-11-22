import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './RollDice.css';

class RollDice extends Component {
  static defaultProps = {
    sides: ['I', 'II', 'III', 'IV', 'V', 'VI',
      'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII',
      'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'
    ]
  };

  constructor(props) {
    super(props);

    this.state = {
      rolls: [],
      rolling: false,
      numberOfDice: 2,
      diceType: 'd6',
      error: null,
      sum: 0
    };
    this.roll = this.roll.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async roll() {
    const { numberOfDice, diceType } = this.state;
    this.setState({ rolling: true, error: null, sum: 0 });

    try {
      const response = await fetch(`http://localhost:5000/roll-dice?numberOfDice=${numberOfDice}&type=${diceType}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      this.setState({ rolls: data, sum: data.reduce((total, roll) => total + parseInt(roll), 0) });

      // Adiciona um atraso antes de definir rolling como false
      setTimeout(() => {
        this.setState({ rolling: false });
      }, 2000); // 2 segundos de atraso
    } catch (error) {
      console.error('Error rolling dice:', error);
      this.setState({ rolling: false, error: 'Failed to roll dice. Please try again.' });
    }
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  render() {
    const { rolls, rolling, numberOfDice, diceType, error, sum } = this.state;

    return (
      <div className="bg-container">
        <div className="app-container">
          <h1 className="heading">Dices</h1>
          <div>
            <label>
              Number of Dice:
              <input
                type="number"
                name="numberOfDice"
                value={numberOfDice}
                onChange={this.handleChange}
                min="1"
                max="6"
              />
            </label>
            <label>
              Type of Dice:
              <select
                name="diceType"
                value={diceType}
                onChange={this.handleChange}
              >
                <option value="d4">d4</option>
                <option value="d6">d6</option>
                <option value="d8">d8</option>
                <option value="d10">d10</option>
                <option value="d12">d12</option>
                <option value="d20">d20</option>
              </select>
            </label>
          </div>
          <div>
            <button className="button" type="button" onClick={this.roll} disabled={rolling}>
              {rolling ? 'Rolling...' : 'Roll Dice!'}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
          <div className="RollDice-container">
            {rolls.map((roll, index) => {
              const rollIndex = parseInt(roll) - 1;
              return (
                <div key={index} className={`Die ${rolling ? 'Die-rolling' : ''}`}>
                  {this.props.sides[rollIndex]}
                </div>
              );
            })}
          </div>
          <p>Sum: {sum}</p>
        </div>
      </div>
    );
  }
}

RollDice.propTypes = {
  sides: PropTypes.arrayOf(PropTypes.string)
};

export default RollDice;