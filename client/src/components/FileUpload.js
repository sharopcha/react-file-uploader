import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Message from './Message';
import Progress from './Progress';

export const FileUpload = () => {
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choose file');
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('');
  const [uploadPrecentage, setUploadPrecentage] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (showAlert) setTimeout(() => setShowAlert(false), 5000);
    if (showProgressBar) setTimeout(() => setShowProgressBar(false), 5000);
  }, [showAlert, showProgressBar]);

  const onChange = e => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (showAlert) setShowProgressBar(true);
    const formData = new FormData();

    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        setUploadPrecentage(
          parseInt(Math.round(progressEvent.loaded * 100) / progressEvent.total)
        );
        setTimeout(() => {
          setUploadPrecentage(0);
        }, 5000);

        setShowProgressBar(true);
      },
    };

    try {
      const res = await axios.post('/upload', formData, config);

      const { fileName, filePath } = res.data;

      setUploadedFile({ fileName, filePath });
      setMessage('File Uploaded');
    } catch (err) {
      if (err.response.status === 500) {
        setShowAlert(true);
        setMessage('There was a problem with the server');
      } else {
        setShowAlert(true);
        setMessage(err.response.data.msg);
      }
    }
  };

  return (
    <>
      {message && showAlert && <Message msg={message} />}
      <form onSubmit={onSubmit}>
        <div className="custom-file">
          <input
            type="file"
            className="custom-file-input"
            onChange={onChange}
          />
          <label htmlFor="customFile" className="custom-file-label">
            {filename}
          </label>
        </div>
        {showProgressBar && <Progress precentage={uploadPrecentage} />}

        <input
          type="submit"
          value="Upload"
          className="btn btn-primary btn-block mt-4"
        />
      </form>
      {uploadedFile ? (
        <div className="row mt-5">
          <div className="col-md-6 m-auto">
            <h3 className="text-center">{uploadedFile.fileName}</h3>
            <img src={uploadedFile.filePath} style={{ width: '100%' }} alt="" />
          </div>
        </div>
      ) : null}
    </>
  );
};
