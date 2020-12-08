/* global document window */
import React from 'react';
import PropTypes from 'prop-types'
// import cx from 'classnames';
// import debounce from 'lodash.debounce';

export default class Pane extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string,
        resizable: PropTypes.bool,
        centered: PropTypes.bool,
        onResizeStart: PropTypes.func,
        onResize: PropTypes.func,
        onResizeEnd: PropTypes.func,
        className: PropTypes.string,
        show: PropTypes.bool,
        clearLogs: PropTypes.func,
        onFilterChange: PropTypes.func,
        children: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.node),
            PropTypes.node
        ]),
        logFilterString: PropTypes.string
    }

    constructor(props) {
        super(props);
        this.state = {
            style: {
              height: props.resizable ? `${window.innerHeight / 3}px` : '',
            },
            pointerDown: false,
            lastKnownPointer: {},
            value: '1',
            options: [{
                value: '1',
                display: 'testing',
            },
            {
                value: '2',
                display: 'mmmk',
            },
            {
                value: '3',
                display: 'wow',
            }]
        };

        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handlePointerMove = /*debounce(*/this.handlePointerMove.bind(this)/*)*/;
        this.handlePointerUp = this.handlePointerUp.bind(this);
        this.update = this.update.bind(this);
    }

    componentWillUnmount() {
        if (this.props.resizable) {
            document.removeEventListener('mousemove', this.handlePointerMove);
            document.removeEventListener('mouseup', this.handlePointerUp);
            document.removeEventListener('touchmove', this.handlePointerMove);
            document.removeEventListener('touchend', this.handlePointerUp);
        }
    }

    update(newValue) {
        this.setState({value: newValue});
    }

    handlePointerDown(e) {
        this.props.onResizeStart();
        e.stopPropagation();
        e.preventDefault();
        let { clientX, clientY } = e;
        if (!clientX) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        document.addEventListener('mousemove', this.handlePointerMove);
        document.addEventListener('mouseup', this.handlePointerUp);
        document.addEventListener('touchmove', this.handlePointerMove);
        document.addEventListener('touchend', this.handlePointerUp);

        this.setState({
            pointerDown: true,
            lastKnownPointer: { x: clientX, y: clientY }
        });
    }

    handlePointerMove(e) {
        if (this.state.pointerDown) {
            e.preventDefault();
            e.stopPropagation();
            requestAnimationFrame(() => {
                const { onResize } = this.props;
                const { style } = this.state;
                const { lastKnownPointer } = this.state;
                let { clientX, clientY } = e;
                if (!clientX) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                }

                const diff = {
                    x: lastKnownPointer.x - clientX,
                    y: lastKnownPointer.y - clientY
                };

                const currentStyle = Object.keys(style).length ? style : { height: window.getComputedStyle(this.pane).height };

                this.setState({
                    style: { height: `${parseInt(currentStyle.height, 10) + parseInt(diff.y, 10)}px` },
                    lastKnownPointer: { x: clientX, y: clientY }
                });
                onResize(Date.now().toString());
            });
        }
    }

    handlePointerUp(e) {
        this.props.onResizeEnd();
        e.stopPropagation();
        if (this.state.pointerDown) {
            document.removeEventListener('mousemove', this.handlePointerMove);
            document.removeEventListener('mouseup', this.handlePointerUp);
            document.removeEventListener('touchmove', this.handlePointerMove);
            document.removeEventListener('touchend', this.handlePointerUp);
            this.setState({ pointerDown: false });
        }
    }

    render() {
        const { title, children, resizable, className = '', clearLogs, onFilterChange, logFilterString } = this.props;

        const ResizeHandle = (
            <div className="flex-item tc">
                <div
                    className="dib resize-vertical w-16px h-12px"
                    onMouseDown={this.handlePointerDown}
                    onTouchStart={this.handlePointerDown}
                />
            </div>
        );

        const TitleBar = (title || resizable) && (
            <div className="pane__titlebar flex items-center justify-center shrink-0 h3 ph2 f5 fw5 ttu ls2 mid-grey bg-ice"
                style={{height: '40px'}}>
                <div className="flex-item" style={{display: 'flex'}}>
                    <span className="pane__title" style={{display: 'flex', marginRight: 'auto', alignItems: 'center', flexGrow: 1}}>{title}</span>
                    <input className="dark-grey" type="text" style={{display: 'flex', marginLeft: 'auto', flexGrow: 3}}
                        value={logFilterString}
                        placeholder="filter output" onChange={ onFilterChange }></input>
                </div>
                {resizable ? ResizeHandle : null}
                <div className="flex-item" style={{textAlign: 'right'}}>
                    <button className="bn outline-0 w-50 mid-grey bg-grey--light cursor-pointer
                        hover-bg-grey--dark active-bg-manticore-blue active-white mt4"
                        style={{margin:0, paddingTop: '5px', paddingBottom: '5px'}}
                        onClick={() => { clearLogs(); }}>Clear Logs</button>
                    <span className="pane__titlebar-placeholder "></span>
                </div>
            </div>
        );

        return (
            <div
                ref={(pane) => { this.pane = pane; }}
                className={`flex grow-1 pane flex-column min-h3 relative overflow-hidden ${className}`}
                style={{ height: `${this.state.style ? this.state.style.height : ''}` }}
            >
                {TitleBar}
                <div className='pane__body flex flex-auto overflow-hidden flex-column h-100--h3'>
                    {children}
                </div>
            </div>
        );
    }
}
