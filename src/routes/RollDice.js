import React, { Component } from 'react';
import './RollDice.css';
import Die from './Die';
import axios from 'axios';

class RollDice extends Component {
  // Default props for dice sides
  static defaultProps = {
    sides: ['one', 'two', 'three', 'four', 'five', 'six']
  };

  constructor(props) {
    super(props);

    // State
    this.state = {
      rolls: [],
      rolling: false,
      numberOfDice: 2, // Default to rolling 2 dice
      diceType: 'd6' // Default to d6
    };
    this.roll = this.roll.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async roll() {
    const { numberOfDice, diceType } = this.state;
    this.setState({ rolling: true });

    try {
      // Make API call to roll dice
      const response = await axios.get(`/roll-dice?numberOfDice=${numberOfDice}&type=${diceType}`);
      this.setState({ rolls: response.data.rolls, rolling: false });
    } catch (error) {
      console.error('Error rolling dice:', error);
      this.setState({ rolling: false });
    }
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  render() {
    const handleBtn = this.state.rolling ? 'RollDice-rolling' : '';
    const { rolls, rolling, numberOfDice, diceType } = this.state;

    return (
      <div className='RollDice'>
        <div className='RollDice-container'>
          {rolls.map((roll, index) => (
            <Die key={index} face={this.props.sides[parseInt(roll) - 1]} rolling={rolling} />
          ))}
        </div>
        <div>
          <label>
            Number of Dice:
            <input
              type="number"
              name="numberOfDice"
              value={numberOfDice}
              onChange={this.handleChange}
              min="1"
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
        <button className={handleBtn} disabled={rolling} onClick={this.roll}>
          {rolling ? 'Rolling' : 'Roll Dice!'}
        </button>
      </div>
    );
  }
}

export default RollDice;