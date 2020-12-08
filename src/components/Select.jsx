/* global window */
import React from 'react';
import PropTypes from 'prop-types'

export default class Select extends React.PureComponent {
    static propTypes = {
        options: PropTypes.arrayOf(PropTypes.object).isRequired,
        selected: PropTypes.string,
        onSelect: PropTypes.func.isRequired,
        className: PropTypes.string,
        disabled: PropTypes.bool
    }

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.state = {
            open: false
        };
    }

    componentDidMount() {
        window.addEventListener('click', this.handleDocumentClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleDocumentClick);
    }

    handleClick() {
        this.setState({ open: !this.state.open });
    }

    handleSelect(option) {
        this.setState({
            open: false
        }, this.props.onSelect(option));
    }

    handleDocumentClick(e) {
        e.stopPropagation();
        const target = e.target;
        const select = this.reactSelect;

        if (select && !select.contains(target)) {
            this.setState({ open: false });
        }
    }

    render() {
        const { options, selected, className = '' } = this.props;
        const { open } = this.state;
        let current = null;
        options.forEach((option) => {
            if (option.value === selected) {
                current = option;
            }
        });
        if (!current) {
            current = options[0];
        }
        return (
            <div
                className={'react-select' + className}
                ref={(c) => { this.reactSelect = c; }}
                onClick={() => this.handleClick()}
            >
                <div tabIndex="-1" className="react-select__display ph2 pv1 bg-grey--light br2 cursor-pointer hover-bg-grey--dark dark-grey">{ current.display || current.value }</div>
                <div className="react-select__options-container">
                    <ul className={`react-select__options list pa0 ma0 br2 transition-reveal shadow-2 dark-grey ${open ? 'h-auto o-100 visible transition-no-delay mt1' : 'h0 o-0 hidden'}`} >
                        { options.map(option => (
                            <li key={option.value}
                                className="react-select__option ph2 pv1 cursor-pointer hover-bg-washed-blue"
                                onClick={() => this.handleSelect(option)}
                            >{ option.display || option.value }</li>
                        )) }
                    </ul>
                </div>
            </div>
        );
    }
}
