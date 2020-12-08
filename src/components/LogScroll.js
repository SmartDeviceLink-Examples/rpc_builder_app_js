import React from 'react';
import PropTypes from 'prop-types';
import BackgroundLight from '../img/manticore/scrollbar_bg_light.png';
import AnchorInactive from '../img/manticore/anchor_icon_inactive.png';
import AnchorActive from '../img/manticore/anchor_icon_active.png';

class LogScroll extends React.Component {

    static propTypes = {
        maxViewableItems: PropTypes.number.isRequired,
        scrollSensitivity: PropTypes.number.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            lastItemViewing: Math.min(React.Children.count(props.children), props.maxViewableItems),
            atEnd: true,
            anchorButtonActive: true
        };

        this.updateLocalScroll = this.updateLocalScroll.bind(this);
        this.updateGlobalScroll = this.updateGlobalScroll.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleToBottomButtonDown = this.handleToBottomButtonDown.bind(this);
        this.handleToBottomButtonUp = this.handleToBottomButtonUp.bind(this);
        this.localScrollClickedDown = this.localScrollClickedDown.bind(this);
        this.globalScrollClickedDown = this.globalScrollClickedDown.bind(this);
        this.scrollBackgroundClicked = this.scrollBackgroundClicked.bind(this);
        this.jumpToBottom = this.jumpToBottom.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.scrollLocation = 0;
        this.scrollBarHeight = 0;

        this.localScrollActive = false; // Reference that local scroll is currently clicked; Mouse movements will move scrollbar
        this.globalScrollActive = false; // Reference that global scroll is currently clicked; Mouse movements will move scrillbar
        this.mouseY = 0; // y location of the mouse; difference between this and next mouse location used to calculate scroll amount
        this.ignoreLocalScrollUpdate = false; // Used in componentDidUpdate to ignore local scroll updates when global scroll is being dragged
    }

    componentDidMount() {
        // Handle scrolling
        this.itemContainer.addEventListener('wheel', this.handleScroll);
        // Handle mouse down click event of 'to bottom' button
        this.bottomButton.addEventListener('mousedown', this.handleToBottomButtonDown);
        // Handle mouse down click events for local and global scroll
        this.scrollLocal.addEventListener('mousedown', this.localScrollClickedDown);
        this.scrollGlobal.addEventListener('mousedown', this.globalScrollClickedDown);
        this.scrollBar.addEventListener('mousedown', this.scrollBackgroundClicked);
        // Handle mouse up event for window
        // Needed in case user clicks down on something, moves mouse
        // off of element, then releases
        window.addEventListener('mouseup', this.handleToBottomButtonUp);
        // Handle mouse movement
        // Needed to detect dragging local and global scroll dragging
        window.addEventListener('mousemove', this.handleMouseMove);
    }

    componentWillUnmount() {
        // Remove all event listeners when component is unmounted
        this.itemContainer.removeEventListener('wheel', this.handleScroll);
        this.bottomButton.removeEventListener('mousedown', this.handleToBottomButtonDown);
        this.scrollLocal.removeEventListener('mousedown', this.localScrollClickedDown);
        this.scrollGlobal.removeEventListener('mousedown', this.globalScrollClickedDown);
        this.scrollBar.removeEventListener('mousedown', this.scrollBackgroundClicked);
        window.removeEventListener('mouseup', this.handleToBottomButtonUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
    }

    shouldComponentUpdate(nextProps, nextState) {
        var childrenChanged = React.Children.count(nextProps.children) !== React.Children.count(this.props.children);
        var itemViewChanged = nextState.lastItemViewing !== this.state.lastItemViewing;
        var atEndChanged = nextState.atEnd && !this.state.atEnd;
        var heightChanged = this.scrollBarHeight !== this.scrollBar.clientHeight;
        var bottomButtonChanged = this.state.anchorButtonActive !== nextState.anchorButtonActive;
        this.scrollBarHeight = this.scrollBar.clientHeight;
        return childrenChanged || itemViewChanged || atEndChanged || heightChanged || bottomButtonChanged;
    }

    componentDidUpdate(prevProps, prevState) {
        this.updateGlobalScroll();

        // If scrolled to the end or just scrolled past the end, set the scroll to lock to the bottom
        if (this.state.atEnd || this.state.lastItemViewing > React.Children.count(this.props.children)) {
            this.jumpToBottom();
            return;
        }

        // Calculate the number of viewable items that have changed since the last state
        var itemsChanged = Math.abs(prevState.lastItemViewing - this.state.lastItemViewing);
        var childrenNumber = 0;
        if (prevState.lastItemViewing < this.state.lastItemViewing) {
            //scrolled down
            childrenNumber = Math.max((this.props.maxViewableItems / 2), (this.props.maxViewableItems - itemsChanged));
        } else if (prevState.lastItemViewing > this.state.lastItemViewing) {
            //scrolled up
            childrenNumber = Math.min((this.props.maxViewableItems / 2), itemsChanged);
        } else {
            return;
        }
        // Set the number to the total number of children if the calculated number
        // is less than it
        childrenNumber = Math.min(childrenNumber, React.Children.count(this.props.children));

        if (!this.ignoreLocalScrollUpdate) {
            // Calculate where to set the new scroll position to
            var newScrollPosition = 0;
            for (let i = 0; i < childrenNumber; i++) {
                newScrollPosition += this.visibleItems.children[i].clientHeight;
            }
            if (prevState.lastItemViewing < this.state.lastItemViewing) {
                newScrollPosition -= this.itemContainer.clientHeight;
            }
            this.scrollLocation = newScrollPosition;
            this.itemContainer.scrollTop = newScrollPosition;
            this.updateLocalScroll();
        }
    }

    handleScroll(e) {
        var scrollDelta = Math.max(-1, Math.min(1, e.deltaY)) * this.props.scrollSensitivity;

        var prevLocation = this.scrollLocation;
        var currLocation = this.itemContainer.scrollTop + scrollDelta;
        var scrollHeight = this.itemContainer.scrollHeight - this.itemContainer.clientHeight;

        // Position hasn't changed; Do nothing
        if (prevLocation === currLocation) {
            return;
        }

        this.updateLocalScroll();

        // User has not scrolled to the top or bottom.
        // Don't need to change what items are rendered.
        // Just need to update scroll location
        if (currLocation > 0 && currLocation < scrollHeight) {
            this.scrollLocation = currLocation;
            this.itemContainer.scrollTop = currLocation;
            this.setState({ atEnd: false, anchorButtonActive: false });
            return;
        }

        // User has scrolled to the end of all items. Lock the scroll at the bottom
        if (currLocation >= scrollHeight && this.state.lastItemViewing === React.Children.count(this.props.children)) {
            this.setState({ atEnd: true, anchorButtonActive: true });
            return;
        }
        // User has scrolled to the beginning of all items. Set the scroll position to 0
        if (currLocation <= 0 && this.state.lastItemViewing <= this.props.maxViewableItems) {
            this.scrollLocation = 0;
            this.itemContainer.scrollTop = 0;
            return;
        }

        // User has initiated new items to be rendered on screen by hitting the top or bottom
        // of what is currently rendered. Calculate what item will be the last to be rendered
        // on screen.
        var itemViewChange = currLocation <= 0 ? -(this.props.maxViewableItems / 2) : (this.props.maxViewableItems / 2);
        var newItemView = this.state.lastItemViewing + itemViewChange;
        newItemView = Math.max(newItemView, this.props.maxViewableItems);
        newItemView = Math.min(newItemView, React.Children.count(this.props.children));
        this.setState({ lastItemViewing: newItemView });
    }

    handleToBottomButtonDown() {
        this.setState({ anchorButtonActive: true });
    }

    handleToBottomButtonUp() {
        this.localScrollActive = false;
        this.globalScrollActive = false;
        this.ignoreLocalScrollUpdate = false;
    }

    localScrollClickedDown(e) {
        this.localScrollActive = true;
        this.mouseY = e.clientY;
    }

    globalScrollClickedDown(e) {
        if (!this.localScrollActive) {
            this.globalScrollActive = true;
            this.ignoreLocalScrollUpdate = true;
            this.mouseY = e.clientY;
        }
    }

    scrollBackgroundClicked(e) {
        if (!this.localScrollActive && !this.globalScrollActive) {
            var scrollBarPosY = this.scrollBar.getBoundingClientRect().top;
            var clickGlobalPosY = e.clientY;
            var clickLocalPos = Math.floor(clickGlobalPosY - scrollBarPosY);

            var percentageView = Math.min(clickLocalPos / (this.scrollBar.clientHeight - this.scrollGlobal.clientHeight), 1);
            var newItemView = Math.floor(React.Children.count(this.props.children) * percentageView);
            this.ignoreLocalScrollUpdate = true;
            this.itemContainer.scrollTop = 1;
            this.setState({ lastItemViewing: newItemView, atEnd: false, anchorButtonActive: false });
            this.updateGlobalScroll();
            this.updateLocalScroll();
        }
    }

    handleMouseMove(e) {
        var percentageChange;
        var scrollChange;
        if (this.localScrollActive) {
            // Calculate local scroll movement based on itemContainer scrollHeight,
            // update its scroll location, then update the local scroll
            percentageChange = (e.clientY - this.mouseY) / (this.scrollGlobal.clientHeight - this.scrollLocal.clientHeight);
            var scrollHeight = this.itemContainer.scrollHeight - this.itemContainer.clientHeight;
            scrollChange = percentageChange * scrollHeight;
            this.mouseY = e.clientY;
            this.itemContainer.scrollTop += scrollChange;
            this.setState({ atEnd: false, anchorButtonActive: false });
            this.updateLocalScroll();
        } else if (this.globalScrollActive) {
            // Calculate global scroll movement based on lastItemViewing,
            // Update its item view location, then update the global and local scroll
            percentageChange = (e.clientY - this.mouseY) / (this.scrollBar.clientHeight - this.scrollGlobal.clientHeight);
            scrollChange = Math.ceil(percentageChange * React.Children.count(this.props.children));
            var newItemView = Math.max(this.props.maxViewableItems, this.state.lastItemViewing + scrollChange);
            newItemView = Math.min(newItemView, React.Children.count(this.props.children));
            this.itemContainer.scrollTop = 1;
            this.setState({ lastItemViewing: newItemView, atEnd: false, anchorButtonActive: false });
            this.updateGlobalScroll();
            this.updateLocalScroll();
            this.mouseY = e.clientY;
        }
    }

    updateGlobalScroll() {
        // Calculate where the global scroll bar should be placed based on
        // the percentage of the last viewable item to total number of items
        var numChildren = React.Children.count(this.props.children);
        var h = this.scrollBar.clientHeight / Math.max(Math.ceil(numChildren / this.props.maxViewableItems), 1);
        h = Math.max(h, 100);
        var percentViewing = (this.state.lastItemViewing - this.props.maxViewableItems) / (numChildren - this.props.maxViewableItems);
        if (this.state.lastItemViewing <= this.props.maxViewableItems) {
            percentViewing = 0;
        }
        var top = (this.scrollBar.clientHeight - h) * percentViewing;

        this.scrollGlobal.style.height = h + "px";
        this.scrollGlobal.style.top = top + "px";
    }

    updateLocalScroll() {
        // Calculate where the local scroll bar should be placed based on
        // the percentage of scroll location to total scroll height
        var scrollHeight = this.itemContainer.scrollHeight - this.itemContainer.clientHeight;
        if (scrollHeight <= 0) {
            // If total scroll height is less than container size, set to 1
            // since user is at the bottom
            scrollHeight = 1;
        }
        var percentScrolled = this.itemContainer.scrollTop / scrollHeight;
        var p = ((this.scrollGlobal.clientHeight - this.scrollLocal.clientHeight) * percentScrolled);
        this.scrollLocal.style.top = p + "px";
    }

    jumpToBottom() {
        this.setState({ atEnd: true, lastItemViewing: React.Children.count(this.props.children), anchorButtonActive: true });
        this.scrollLocation = this.itemContainer.scrollHeight;
        this.itemContainer.scrollTop = this.itemContainer.scrollHeight;
        this.updateGlobalScroll();
        this.updateLocalScroll();
    }

    render() {
        var outerFlex = { 'height': '100%', 'width': '100%', 'display': 'flex', 'flexDirection': 'row', 'flexWrap': 'nowrap' };
        var logFlex = { 'maxWidth': 'calc(100% - 30px)', 'flex': '1', 'display': 'flex' };
        var logs = { 'width': '100%', 'overflow': 'hidden' };
        var scrollFlex = { 'minWidth': '30px', 'width': '30px', 'display': 'flex', 'flexDirection': 'column' };
        var scrollBar = { 'flex': '1', 'position': 'relative', 'backgroundImage': 'url(' + BackgroundLight + ')', 'backgroundSize': '100% auto', 'backgroundRepeat': 'repeat-y' };
        var scrollGlobal = { 'height': '100%', 'width': '100%', 'position': 'absolute', 'background': 'rgba(203, 208, 216, 0.5)' };
        var scrollLocal = { 'height': '10%', 'width': '100%', 'position': 'absolute', 'background': 'rgba(203, 208, 216, 1)' };

        var buttonActive = this.state.anchorButtonActive ? AnchorActive : AnchorInactive;
        var toBottomButton = { 'height': '30px', 'backgroundImage': 'url(' + buttonActive + ')', 'backgroundSize': '100% 100%' };

        var beginningItem = Math.max(this.state.lastItemViewing - this.props.maxViewableItems, 0);

        return (
            <div style={outerFlex}>
                <div style={logFlex}>
                    <div ref={c => this.itemContainer = c} style={logs} className={`bg-log manitcore-log__container h-100`}>
                        <div ref={c => this.visibleItems = c}>
                            {React.Children.toArray(this.props.children)
                                .slice(beginningItem, this.state.lastItemViewing)
                                .map(item => item)
                            }
                        </div>
                    </div>
                </div>
                <div style={scrollFlex}>
                    <div ref={c => this.scrollBar = c} style={scrollBar}>
                        <div ref={c => this.scrollGlobal = c} style={scrollGlobal}>
                            <div ref={c => this.scrollLocal = c} style={scrollLocal}></div>
                        </div>
                    </div>
                    <div ref={c => this.bottomButton = c} style={toBottomButton} onClick={this.jumpToBottom}></div>
                </div>
            </div>
        );
    }
}

export default LogScroll;
