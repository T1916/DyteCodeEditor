//client/arc/App.js

import React, { Component } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import Pusher from 'pusher-js';
import pushid from 'pushid';
import axios from 'axios';



import './App.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';

class App extends Component 
{
  constructor() {
    super();
    this.state = {
      id: '',
      html: '',
      css: '',
      js: '',
    };

    this.pusher = new Pusher("395deca692bfa0edccaf", {
      cluster: "ap1",
      forceTLS: true
    });

    this.channel = this.pusher.subscribe("editor");
  }

  componentDidUpdate() {
    this.runCode();
  }

  componentDidMount() {
    this.setState({
      id: pushid(),
    });

    this.channel.bind("code-update", data => {
      const{id} = this.state;
      if(data.id === id) return;

      this.setState({
        html: data.html,
        css: data.css,
        js: data.js,
      });
    });
  }

  syncUpdates = () => {
    const data = {...this.state};

    axios
      .post("http://localhost:5000/update-editor", data)
      .catch(console.error);
  };

  runCode = () => {
    const { html, css, js } = this.state;

    const iframe = this.refs.iframe;
    const document = iframe.contentDocument;
    const documentContents = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
        <style>
          ${css}
        </style>
      </head>
      <body>
        ${html}

        <script type="text/javascript" src="function.js">
          ${js}
        </script>
      </body>
      </html>
    `;

    document.open();
    document.write(documentContents);
    document.close();
  };


  render() {
    const { html, js, css } = this.state;
    const codeMirrorOptions = {
      theme: "material",
      lineNumbers: true,
      scrollbarStyle: null,
      lineWrapping: true,
    };  

    return (
      <div className="App">
          <section className="playground">
          <div class="dropdown">
            <button type="button" class="dropbtn">File Explorer</button>
            <div class = "dropdown-content">
              <a href="#">Index.html</a>
              <a href="#">Index.css</a>
              <a href="#">Index.js</a>
            </div>
            </div>
          <div className="code-editor html-code">
          <div className="editor-header" id="html">Index.html</div>
            <CodeMirror
              value={html}
              options={{
                mode: 'htmlmixed',
                ...codeMirrorOptions,
              }}
              onBeforeChange={(editor, data, html) => {
                this.setState({ html }, () => this.syncUpdates());
              }}
            />
          </div>
          <div className="code-editor css-code">
            <div className="editor-header">Index.css</div>
            <CodeMirror
              value={css}
              options={{
                mode: 'css',
                ...codeMirrorOptions,
              }}
              onBeforeChange={(editor, data, css) => {
                this.setState({ css }, () => this.syncUpdates());
              }}
            />
          </div>
          <div className="code-editor js-code">
            <div className="editor-header">Index.js</div>
            <CodeMirror
              value={js}
              options={{
                mode: 'javascript',
                ...codeMirrorOptions,
              }}
              onBeforeChange={(editor, data, js) => {
                this.setState({ js }, () => this.syncUpdates());
              }}
            />
          </div>
        </section>

        
        
        <section className="result">
        <div className = "result-header">Live View</div>        
          <iframe title="result" className="iframe" ref="iframe" />
        </section>
      </div>
    );
  }

}


export default App;


