'use client'

import { useRef } from 'react'
import jsPDF from 'jspdf'
import { FiDownload } from 'react-icons/fi'

interface ResumePreviewProps {
  resumeData: any
}

export default function ResumePreview({ resumeData }: ResumePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = () => {
    if (!previewRef.current) return

    const pdf = new jsPDF('p', 'mm', 'a4')
    const element = previewRef.current

    // Simple PDF generation (for production, consider using html2canvas or a more robust solution)
    pdf.setFontSize(20)
    pdf.text(resumeData.personalInfo.fullName || 'Your Name', 20, 20)
    
    pdf.setFontSize(12)
    let yPos = 30
    if (resumeData.personalInfo.email) {
      pdf.text(`Email: ${resumeData.personalInfo.email}`, 20, yPos)
      yPos += 7
    }
    if (resumeData.personalInfo.phone) {
      pdf.text(`Phone: ${resumeData.personalInfo.phone}`, 20, yPos)
      yPos += 7
    }

    if (resumeData.summary) {
      yPos += 5
      pdf.setFontSize(14)
      pdf.text('Summary', 20, yPos)
      yPos += 7
      pdf.setFontSize(10)
      const summaryLines = pdf.splitTextToSize(resumeData.summary, 170)
      pdf.text(summaryLines, 20, yPos)
      yPos += summaryLines.length * 5 + 5
    }

    if (resumeData.experience.length > 0) {
      pdf.setFontSize(14)
      pdf.text('Experience', 20, yPos)
      yPos += 7
      pdf.setFontSize(10)
      resumeData.experience.forEach((exp: any) => {
        pdf.setFontSize(12)
        pdf.text(`${exp.title || ''} at ${exp.company || ''}`, 20, yPos)
        yPos += 7
        pdf.setFontSize(10)
        if (exp.description) {
          const descLines = pdf.splitTextToSize(exp.description, 170)
          pdf.text(descLines, 20, yPos)
          yPos += descLines.length * 5 + 5
        }
      })
    }

    pdf.save(`${resumeData.personalInfo.fullName || 'resume'}-resume.pdf`)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Preview</h2>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <FiDownload className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>

      <div
        ref={previewRef}
        className="bg-white border-2 border-gray-200 p-8 min-h-[800px]"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {resumeData.personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="text-sm text-gray-600 space-y-1">
            {resumeData.personalInfo.email && <p>{resumeData.personalInfo.email}</p>}
            {resumeData.personalInfo.phone && <p>{resumeData.personalInfo.phone}</p>}
            {resumeData.personalInfo.address && <p>{resumeData.personalInfo.address}</p>}
            <div className="flex space-x-4 mt-2">
              {resumeData.personalInfo.linkedin && (
                <a href={resumeData.personalInfo.linkedin} className="text-primary-600">
                  LinkedIn
                </a>
              )}
              {resumeData.personalInfo.github && (
                <a href={resumeData.personalInfo.github} className="text-primary-600">
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        {resumeData.summary && (
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
              Professional Summary
            </h2>
            <p className="text-gray-700 whitespace-pre-line">{resumeData.summary}</p>
          </section>
        )}

        {/* Experience */}
        {resumeData.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp: any, index: number) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {exp.title || 'Job Title'}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-1">{exp.company || 'Company Name'}</p>
                  {exp.description && (
                    <p className="text-gray-600 text-sm whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {resumeData.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              Education
            </h2>
            <div className="space-y-3">
              {resumeData.education.map((edu: any, index: number) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900">{edu.degree || 'Degree'}</h3>
                  <p className="text-gray-700">
                    {edu.institution || 'Institution'} {edu.year && `- ${edu.year}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill: any, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm"
                >
                  {skill.name || 'Skill'}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
