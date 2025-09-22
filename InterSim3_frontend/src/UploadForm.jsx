import React, { useState } from 'react';
import './UploadForm.css';
import { setupInterview } from './api/interviewApi';

const UploadForm = ({ onCodeGenerated }) => {
    const [file, setFile] = useState(null);
    const [companyName, setCompanyName] = useState('');
    const [jobRole, setJobRole] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            alert('Please select a PDF file only.');
            e.target.value = ''; // Clear the file input
            return;
        }
        setFile(selectedFile);
        console.log('File selected:', {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type !== 'application/pdf') {
                alert('Please drop a PDF file only.');
                return;
            }
            setFile(droppedFile);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file || !companyName || !jobRole) {
            alert('Please fill out all fields and select a file.');
            return;
        }

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file only.');
            return;
        }

        // Check file size (optional - adjust limit as needed)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('File size is too large. Please upload a PDF smaller than 10MB.');
            return;
        }

        setIsLoading(true);
        
        try {
            // Convert PDF to base64
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onload = () => {
                    const base64String = reader.result.split(',')[1];
                    resolve(base64String);
                };
                reader.onerror = reject;
            });
            
            reader.readAsDataURL(file);
            const base64PDF = await base64Promise;
            
            // Call the setup interview API
            const response = await setupInterview({
                job_role: jobRole,
                job_description: `Position at ${companyName}: ${jobRole}`,
                resume_text: base64PDF
            });
            
            if (response && response.access_code) {
                onCodeGenerated(response.access_code);
                console.log('Setup successful:', response.message);
            } else {
                throw new Error('Failed to generate interview code. Please try again.');
            }
            
        } catch (error) {
            console.error('Process failed:', error);
            alert(error.message || 'Failed to process the request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="upload-card">
            <h2>Start a New Interview Simulation</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="company-name">Company Name</label>
                    <input
                        type="text"
                        id="company-name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g., Google"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="job-role">Job Role</label>
                    <input
                        type="text"
                        id="job-role"
                        value={jobRole}
                        onChange={(e) => setJobRole(e.target.value)}
                        placeholder="e.g., Senior Software Engineer"
                    />
                </div>
                <div 
                    className={`drop-area ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input 
                        type="file" 
                        id="file-upload" 
                        className="file-input" 
                        onChange={handleFileChange} 
                        accept=".pdf" 
                    />
                    <label htmlFor="file-upload">
                        {file ? file.name : 'Drag & Drop Resume Here'}
                    </label>
                </div>
                <button type="submit" disabled={isLoading || !file || !companyName || !jobRole}>
                    {isLoading ? 'Processing...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default UploadForm;