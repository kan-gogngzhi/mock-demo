import React from 'react';
import apis from '../API';

const {fetchLinks} = apis;
class Main extends React.Component {
    componentDidMount(){
        console.log('did mount');
        fetchLinks();
    }
    render () {
        return (<div>{'Main'}</div>);
    }
}

export default Main;