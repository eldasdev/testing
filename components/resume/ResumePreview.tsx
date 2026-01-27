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
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    let yPos = margin

    // Colors
    const primaryColor: [number, number, number] = [59, 130, 246] // Blue
    const darkColor: [number, number, number] = [31, 41, 55]
    const grayColor: [number, number, number] = [107, 114, 128]
    const lightGray: [number, number, number] = [156, 163, 175]

    // Helper function to check for new page
    const checkNewPage = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        pdf.addPage()
        yPos = margin
        return true
      }
      return false
    }

    // Helper function to draw section header
    const drawSectionHeader = (title: string) => {
      checkNewPage(20)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...darkColor)
      pdf.text(title, margin, yPos)
      yPos += 2
      // Draw underline
      pdf.setDrawColor(...primaryColor)
      pdf.setLineWidth(0.5)
      pdf.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 8
    }

    // ===== HEADER SECTION =====
    // Name
    pdf.setFontSize(28)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...darkColor)
    pdf.text(resumeData.personalInfo.fullName || 'Your Name', margin, yPos)
    yPos += 10

    // Contact Info Row 1: Email & Phone
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...grayColor)
    
    const contactParts: string[] = []
    if (resumeData.personalInfo.email) contactParts.push(resumeData.personalInfo.email)
    if (resumeData.personalInfo.phone) contactParts.push(resumeData.personalInfo.phone)
    if (contactParts.length > 0) {
      pdf.text(contactParts.join('  |  '), margin, yPos)
      yPos += 5
    }

    // Contact Info Row 2: Address
    if (resumeData.personalInfo.address) {
      pdf.text(resumeData.personalInfo.address, margin, yPos)
      yPos += 5
    }

    // Contact Info Row 3: LinkedIn & GitHub
    const linkParts: string[] = []
    if (resumeData.personalInfo.linkedin) linkParts.push(`LinkedIn: ${resumeData.personalInfo.linkedin}`)
    if (resumeData.personalInfo.github) linkParts.push(`GitHub: ${resumeData.personalInfo.github}`)
    if (resumeData.personalInfo.portfolio) linkParts.push(`Portfolio: ${resumeData.personalInfo.portfolio}`)
    
    if (linkParts.length > 0) {
      pdf.setTextColor(...primaryColor)
      linkParts.forEach(link => {
        pdf.text(link, margin, yPos)
        yPos += 5
      })
    }

    yPos += 5

    // Draw header separator line
    pdf.setDrawColor(...lightGray)
    pdf.setLineWidth(0.3)
    pdf.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 10

    // ===== PROFESSIONAL SUMMARY =====
    if (resumeData.summary) {
      drawSectionHeader('Professional Summary')
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(...grayColor)
      const summaryLines = pdf.splitTextToSize(resumeData.summary, contentWidth)
      summaryLines.forEach((line: string) => {
        checkNewPage(6)
        pdf.text(line, margin, yPos)
        yPos += 5
      })
      yPos += 8
    }

    // ===== EXPERIENCE =====
    if (resumeData.experience && resumeData.experience.length > 0) {
      drawSectionHeader('Experience')
      
      resumeData.experience.forEach((exp: any, index: number) => {
        checkNewPage(25)
        
        // Job Title
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...darkColor)
        pdf.text(exp.title || 'Job Title', margin, yPos)
        
        // Date on right side
        if (exp.startDate || exp.endDate) {
          const dateText = `${exp.startDate || ''} - ${exp.endDate || 'Present'}`
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(...lightGray)
          const dateWidth = pdf.getTextWidth(dateText)
          pdf.text(dateText, pageWidth - margin - dateWidth, yPos)
        }
        yPos += 6

        // Company Name
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...grayColor)
        pdf.text(exp.company || 'Company Name', margin, yPos)
        yPos += 6

        // Description
        if (exp.description) {
          pdf.setFontSize(10)
          pdf.setTextColor(...grayColor)
          const descLines = pdf.splitTextToSize(exp.description, contentWidth)
          descLines.forEach((line: string) => {
            checkNewPage(6)
            pdf.text(line, margin, yPos)
            yPos += 5
          })
        }
        
        yPos += 6
      })
    }

    // ===== EDUCATION =====
    if (resumeData.education && resumeData.education.length > 0) {
      drawSectionHeader('Education')
      
      resumeData.education.forEach((edu: any) => {
        checkNewPage(20)
        
        // Degree
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...darkColor)
        pdf.text(edu.degree || 'Degree', margin, yPos)
        yPos += 6

        // Institution & Year
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...grayColor)
        const eduDetails = `${edu.institution || 'Institution'}${edu.year ? ` - ${edu.year}` : ''}`
        pdf.text(eduDetails, margin, yPos)
        yPos += 8
      })
      yPos += 4
    }

    // ===== SKILLS =====
    if (resumeData.skills && resumeData.skills.length > 0) {
      drawSectionHeader('Skills')
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      
      // Draw skills as tags in a flow layout
      let xPos = margin
      const skillHeight = 7
      const skillPadding = 4
      const skillGap = 3
      
      resumeData.skills.forEach((skill: any) => {
        const skillName = skill.name || skill
        const skillWidth = pdf.getTextWidth(skillName) + (skillPadding * 2)
        
        // Check if we need to wrap to next line
        if (xPos + skillWidth > pageWidth - margin) {
          xPos = margin
          yPos += skillHeight + skillGap
          checkNewPage(skillHeight + 5)
        }
        
        // Draw skill badge background
        pdf.setFillColor(239, 246, 255) // Light blue background
        pdf.roundedRect(xPos, yPos - 5, skillWidth, skillHeight, 2, 2, 'F')
        
        // Draw skill text
        pdf.setTextColor(...primaryColor)
        pdf.text(skillName, xPos + skillPadding, yPos)
        
        xPos += skillWidth + skillGap
      })
      yPos += 12
    }

    // ===== PROJECTS =====
    if (resumeData.projects && resumeData.projects.length > 0) {
      drawSectionHeader('Projects')
      
      resumeData.projects.forEach((project: any) => {
        checkNewPage(20)
        
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...darkColor)
        pdf.text(project.name || 'Project Name', margin, yPos)
        yPos += 6

        if (project.description) {
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(...grayColor)
          const projLines = pdf.splitTextToSize(project.description, contentWidth)
          projLines.forEach((line: string) => {
            checkNewPage(6)
            pdf.text(line, margin, yPos)
            yPos += 5
          })
        }

        if (project.technologies) {
          pdf.setFontSize(9)
          pdf.setTextColor(...primaryColor)
          pdf.text(`Technologies: ${project.technologies}`, margin, yPos)
          yPos += 5
        }
        
        yPos += 4
      })
    }

    // ===== CERTIFICATIONS =====
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      drawSectionHeader('Certifications')
      
      resumeData.certifications.forEach((cert: any) => {
        checkNewPage(12)
        
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...darkColor)
        pdf.text(cert.name || 'Certification', margin, yPos)
        yPos += 5

        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...grayColor)
        const certDetails = `${cert.issuer || ''}${cert.year ? ` - ${cert.year}` : ''}`
        if (certDetails.trim()) {
          pdf.text(certDetails, margin, yPos)
          yPos += 6
        }
      })
      yPos += 4
    }

    // ===== LANGUAGES =====
    if (resumeData.languages && resumeData.languages.length > 0) {
      drawSectionHeader('Languages')
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(...grayColor)
      
      const langText = resumeData.languages.map((lang: any) => {
        if (typeof lang === 'string') return lang
        return `${lang.name}${lang.level ? ` (${lang.level})` : ''}`
      }).join('  •  ')
      
      pdf.text(langText, margin, yPos)
      yPos += 8
    }

    // Save the PDF
    const fileName = (resumeData.personalInfo.fullName || 'resume').replace(/\s+/g, '_')
    pdf.save(`${fileName}_Resume.pdf`)
  }

  return (
    <div className="space-y-4">
      {/* Download Button */}
      <div className="flex justify-end">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl font-medium"
        >
          <FiDownload className="w-5 h-5" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Resume Preview */}
      <div
        ref={previewRef}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 min-h-[900px]"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {/* Header */}
        <div className="border-b-2 border-primary-500 pb-4 mb-6">
          <div className="flex items-start gap-6 mb-3">
            {resumeData.personalInfo.profileImage && (
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-500 flex-shrink-0">
                <img
                  src={resumeData.personalInfo.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {resumeData.personalInfo.fullName || 'Your Name'}
              </h1>
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            {/* Contact Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {resumeData.personalInfo.email && (
                <span>{resumeData.personalInfo.email}</span>
              )}
              {resumeData.personalInfo.phone && (
                <span>{resumeData.personalInfo.phone}</span>
              )}
            </div>
            {resumeData.personalInfo.address && (
              <p>{resumeData.personalInfo.address}</p>
            )}
            {/* Links Row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {resumeData.personalInfo.linkedin && (
                <a 
                  href={resumeData.personalInfo.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {resumeData.personalInfo.github && (
                <a 
                  href={resumeData.personalInfo.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  GitHub
                </a>
              )}
              {resumeData.personalInfo.portfolio && (
                <a 
                  href={resumeData.personalInfo.portfolio} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        {resumeData.summary && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b border-primary-500">
              Professional Summary
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {resumeData.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {resumeData.experience && resumeData.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-primary-500">
              Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900">
                      {exp.title || 'Job Title'}
                    </h3>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {exp.startDate || ''} - {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-1">{exp.company || 'Company Name'}</p>
                  {exp.description && (
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {resumeData.education && resumeData.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-primary-500">
              Education
            </h2>
            <div className="space-y-3">
              {resumeData.education.map((edu: any, index: number) => (
                <div key={index}>
                  <h3 className="font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                  <p className="text-gray-700 text-sm">
                    {edu.institution || 'Institution'}{edu.year ? ` - ${edu.year}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {resumeData.skills && resumeData.skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-primary-500">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill: any, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-primary-700 rounded-md text-sm border border-blue-100"
                >
                  {skill.name || skill || 'Skill'}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {resumeData.projects && resumeData.projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-primary-500">
              Projects
            </h2>
            <div className="space-y-3">
              {resumeData.projects.map((project: any, index: number) => (
                <div key={index}>
                  <h3 className="font-bold text-gray-900">{project.name || 'Project Name'}</h3>
                  {project.description && (
                    <p className="text-gray-600 text-sm">{project.description}</p>
                  )}
                  {project.technologies && (
                    <p className="text-primary-600 text-xs mt-1">
                      Technologies: {project.technologies}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {resumeData.certifications && resumeData.certifications.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-primary-500">
              Certifications
            </h2>
            <div className="space-y-2">
              {resumeData.certifications.map((cert: any, index: number) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 text-sm">{cert.name || 'Certification'}</h3>
                  <p className="text-gray-600 text-xs">
                    {cert.issuer || ''}{cert.year ? ` - ${cert.year}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {resumeData.languages && resumeData.languages.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-primary-500">
              Languages
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {resumeData.languages.map((lang: any, index: number) => (
                <span key={index} className="text-gray-700 text-sm">
                  {typeof lang === 'string' ? lang : `${lang.name}${lang.level ? ` (${lang.level})` : ''}`}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!resumeData.summary && 
         (!resumeData.experience || resumeData.experience.length === 0) && 
         (!resumeData.education || resumeData.education.length === 0) && 
         (!resumeData.skills || resumeData.skills.length === 0) && (
          <div className="text-center py-12 text-gray-400">
            <p>Start filling in your information on the left to see your resume preview here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
