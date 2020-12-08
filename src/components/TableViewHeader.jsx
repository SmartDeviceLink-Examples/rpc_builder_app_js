import React from 'react';
import PropTypes from 'prop-types'

export default class TableViewHeader extends React.PureComponent {
    static propTypes = {
        label: PropTypes.string,
        active: PropTypes.bool,
        tabable: PropTypes.bool
    }

    render() {
        const { label } = this.props;

        return (
            <div className="vehicle-data h6 ph3 flex items-center bg-grey--light fw5 ttu mid-grey ls2 bg-silver tb-header lb"
                style={{justifyContent:"center"}}>
                { label }
            </div>
        );
    }
}