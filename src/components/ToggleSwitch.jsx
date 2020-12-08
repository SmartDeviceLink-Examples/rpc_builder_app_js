import React from 'react';
import PropTypes from 'prop-types'

export default class ToggleSwitch extends React.Component {
    static propTypes = {
        value: PropTypes.bool,
        onChange: PropTypes.func,
        true: PropTypes.string,
        false: PropTypes.string,
        className: PropTypes.string
    };

    render() {
        return (
            <div className={`toggle-switch flex br2 overflow-hidden ${this.props.className}`} style={{ width: '40%' }}>
                <button
                    className={`bn toggle-switch__true flex-item flex items-center justify-center transition-standard pv1 cursor-pointer outline-0 ${this.props.value ? 'bg-manticore-blue white' : 'bg-grey--light dark-grey hover-bg-grey--dark'}`}
                    style={{
                        borderTopLeftRadius: "0.25rem",
                        borderBottomLeftRadius: "0.25rem"
                    }}
                    onClick={() => this.props.onChange(true)}
                >
                    { this.props.true || 'true' }
                </button>
                <button
                    className={`bn toggle-switch__false flex-item flex items-center justify-center transition-standard pv1 cursor-pointer bl b1 b--transparent outline-0 ${!this.props.value ? 'bg-manticore-blue white' : 'bg-grey--light dark-grey hover-bg-grey--dark'}`}
                    style={{
                        borderTopRightRadius: "0.25rem",
                        borderBottomRightRadius: "0.25rem"
                    }}
                    onClick={() => this.props.onChange(false)}
                >
                    { this.props.false || 'false' }
                </button>
            </div>
        );
    }
}
