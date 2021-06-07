import React from 'react';
import PropTypes from 'prop-types'

export class TableView extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string,
        register: PropTypes.func,
        onBack: PropTypes.func,
        active: PropTypes.string,
        className: PropTypes.string,
        children: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.node),
            PropTypes.node
        ])
    }

    constructor(props) {
        super(props);
        this.handleBackClick = this.handleBackClick.bind(this);
        this.state = {
            isShifted: false
        };
    }

    componentDidMount() {
        const { id, register } = this.props;
        register(id);
    }

    handleBackClick() {
        const { id, onBack } = this.props;
        onBack(id, null);
    }

    render() {
        const { active, children, className = '' } = this.props;
        const activeItem = this.props.children.find(child => child.props.id === active);
        const childrenWithProps = React.Children.map(children, child => child.props.tableId ? React.cloneElement(child, {
            active: child.props.id === active,
            tabable: !this.state.isShifted
        }) : child);

        var tableViewHeightStyle = { 'height': '100%' };

        return (
            <div className={`table-view__wrapper overflow-hidden ${className}`} role="menu">
                <div
                    className={`table-view flex w-100 transition-standard ${active ? 'translateX--100' : 'overflow-hidden'}`}
                    style={tableViewHeightStyle}
                >
                    <div className="table-view__list w-100 shrink-0 overflow-scroll">
                        {childrenWithProps}
                    </div>
                    <div className="table-view__content w-100 shrink-0 flex flex-column" aria-label={activeItem && activeItem.props.label} aria-expanded={this.state.isShifted}>
                        <div
                            className="table-view__breadcrumb h6 ph3 dark-grey fw5 bb b--grey--light flex items-center bg-white hover-bg-ice cursor-pointer"
                            onClick={this.handleBackClick}
                            onTouchEnd={this.handleBackClick}
                            tabIndex={this.state.isShifted ? 0 : -1}
                        >
                            <div className="arrow arrow--left" />
                            <div className="ml3">
                                {activeItem && activeItem.props.label}
                            </div>
                        </div>
                        <div className="flex-item overflow-scroll pb4">
                            {activeItem && activeItem.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export class TableViewItem extends React.Component {
    static propTypes = {
        label: PropTypes.string,
        active: PropTypes.bool,
        tabable: PropTypes.bool,
        tableId: PropTypes.string,
        id: PropTypes.string,
        onClick: PropTypes.func,
        className: PropTypes.string
    }

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        const { tableId, id, onClick } = this.props;
        onClick(tableId, id);
    }

    render() {
        const { label, tabable, onClick, className = '' } = this.props;

        if (!onClick) {
            return (
                <div
                    className={`table-view__item h6 ph3 dark-grey fw5 bb b--grey--light flex items-center justify-between bg-white hover-bg-ice dark-gray ${className}`}
                    role="menuitem"
                >
                    {label}
                    <div className="arrow-grey arrow--right" />
                </div>
            );
        }

        return (
            <div
                className={`table-view__item h6 ph3 dark-grey fw5 bb b--grey--light flex items-center justify-between bg-white hover-bg-ice cursor-pointer ${className}`}
                onClick={this.handleClick}
                role="menuitem"
                aria-haspopup="true"
                tabIndex={tabable ? '0' : '-1'}
            >
                {label}
                <div className="arrow arrow--right" />
            </div>
        );
    }
}
