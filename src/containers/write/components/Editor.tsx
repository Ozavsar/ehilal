"use client";
import { Component } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface EditorState {
  text: string;
}

export class Editor extends Component<{}, EditorState> {
  constructor(props: any) {
    super(props);
    this.state = { text: "" };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value: any) {
    this.setState({ text: value });
  }

  render() {
    return <ReactQuill value={this.state.text} onChange={this.handleChange} />;
  }
}
