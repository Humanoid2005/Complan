import React, { useState } from 'react'
import { ChevronDown, ChevronUp, WashingMachine,CarIcon,Medal, Car } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function RulesAndRegulations() {
  const [expandedSection, setExpandedSection] = useState(null)

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const rules = [
    {
      title: "Washing Machine Rules",
      icon: WashingMachine,
      content: [
        "Each user receives 12 credits per semester initially",
        "User earns 10 points for each successful wash",
        "10 points are deducted for each unsuccessful wash",
        "Users can avail 1 credit using 50 points (which can be earned from 5 successful washes)",
        "1 credit is deducted each time a user books a slot regardless of outcome of slot (used or unused)",
        "A user can ask for a slot from another user by requesting for it",
        "User who gave their slot regains 1 credit and user who received the slot loses 1 credit",
        "Users can cancel their booking 2 hours prior to their slot time, doing so will regain their 1 credit"
      ]
    },
    {
      title: "Vehicle Pooling Rules",
      icon: Car,
      content: [
        "To join a pool users must send a join request and are allowed to join multiple pools",
        "Users can leave a pool before its time of departure.",
        "No points are awarded for participating in a pool, since it is just a tool for collaboration."
      ]
    },
    {
      title: "Leaderboard",
      icon: Medal,
      content: [
        "Leaderboard shows the rankings of users registered in ComPlan",
        "Rankings are based on each user's total points (cms) including those used for availing credits",
        "Points deducted due to failure to use washing machine slot are not considered",
        "Example: ",
        "If a user has 90 points, and they used 50 of those to buy an extra credit, then  they will have only 40 credits, but their leaderboard ranking is based on original 90 points",
        "If a user has 90 points, and they lost 20 points for leaving an pool late their leaderboard ranking is based on 70 points"
      ]
    }
  ]

  return (
    <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Rules and Regulations</h1>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            {rules.map((section, index) => (
                <div key={index} className="border-t border-gray-200">
                <button
                    onClick={() => toggleSection(section.title)}
                    className="px-4 py-5 sm:px-6 w-full flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out"
                    aria-expanded={expandedSection === section.title}
                >
                    <div className="flex items-center">
                    <section.icon className="h-6 w-6 text-gray-400 mr-3" aria-hidden="true" />
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{section.title}</h3>
                    </div>
                    {expandedSection === section.title ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                </button>
                {expandedSection === section.title && (
                    <div className="px-4 py-5 sm:p-6">
                    <ul className="list-disc pl-5 space-y-2">
                        {section.content.map((rule, ruleIndex) => (
                        <li key={ruleIndex} className="text-base text-gray-700">{rule}</li>
                        ))}
                    </ul>
                    </div>
                )}
                </div>
            ))}
            </div>
        </div>
        </div>
        <Footer/>
    </>
  )
}