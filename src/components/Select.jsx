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
        this.handleDocumentKeypress = this.handleDocumentKeypress.bind(this);
        this.state = {
            open: false,
            query: '',
            filteredOptions: props.options
        };
    }

    componentDidMount() {
        window.addEventListener('click', this.handleDocumentClick);
        window.addEventListener('keydown', this.handleDocumentKeypress);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleDocumentClick);
        window.removeEventListener('keydown', this.handleDocumentKeypress);
    }

    handleClick() {
        this.setState({ open: !this.state.open, query: '', filteredOptions: this.props.options });
    }

    handleSelect(option) {
        this.setState({
            open: false, query: '', filteredOptions: this.props.options
        }, this.props.onSelect(option));
    }

    handleDocumentClick(e) {
        e.stopPropagation();
        const target = e.target;
        const select = this.reactSelect;

        if (select && !select.contains(target)) {
            this.setState({ open: false, query: '', filteredOptions: this.props.options });
        }
    }

    handleDocumentKeypress(e) {
        const target = e.target;
        const select = this.reactSelect;

        if (select && select.contains(target)) {
            if (e.keyCode === 13) { // enter
                if (this.state.filteredOptions[0]) {
                    this.handleSelect(this.state.filteredOptions[0])
                }
                return;
            }
            var newQuery = this.state.query + String.fromCharCode(e.keyCode);
            var newOptions = this.props.options
                .filter(opt => (opt.display || opt.value).toUpperCase().startsWith(newQuery));

            this.setState({ query: newQuery, filteredOptions: newOptions });
        }
    }

    render() {
        const { selected, className = '' } = this.props;
        const { open, filteredOptions, query } = this.state;
        let current = null;
        filteredOptions.forEach((option) => {
            if (option.value === selected) {
                current = option;
            }
        });
        if (query.length > 0) {
            current = { display: query }
        } else if (!current) {
            current = filteredOptions[0];
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
                        { filteredOptions.map(option => (
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
