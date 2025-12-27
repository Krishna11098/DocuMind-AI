// import Navbar from '@/components/Navbar';

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
//       <Navbar />
      
//       {/* Hero Section */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
//         <div className="text-center">
//           <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
//             Welcome to <span className="text-blue-600">DocuMind AI</span>
//           </h1>
//           <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
//             Intelligent document management powered by AI. Analyze, organize, and assign documents 
//             with automatic categorization, department routing, and priority scoring.
//           </p>
//           <div className="flex justify-center gap-4">
//             <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg">
//               Get Started
//             </button>
//             <button className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-lg">
//               Learn More
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
//         <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
//           Powerful Features
//         </h2>
//         <div className="grid md:grid-cols-3 gap-8">
//           <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
//             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
//               <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//             </div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Document Analysis</h3>
//             <p className="text-gray-600">
//               Automatically extract insights, summaries, and key findings from documents using advanced AI.
//             </p>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
//             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
//               <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//               </svg>
//             </div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Department Routing</h3>
//             <p className="text-gray-600">
//               AI-powered assignment to relevant departments based on document content and type.
//             </p>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
//             <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
//               <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//               </svg>
//             </div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">Priority Scoring</h3>
//             <p className="text-gray-600">
//               Automatic urgency and importance scoring to help prioritize document processing.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* About Section */}
//       <section id="about" className="bg-white py-20">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center max-w-3xl mx-auto">
//             <h2 className="text-4xl font-bold text-gray-900 mb-6">About DocuMind AI</h2>
//             <p className="text-lg text-gray-600 mb-4">
//               DocuMind AI revolutionizes document management by leveraging artificial intelligence 
//               to automate the entire document lifecycle - from upload and analysis to assignment 
//               and tracking.
//             </p>
//             <p className="text-lg text-gray-600">
//               Whether you're managing resumes, invoices, reports, or any other documents, 
//               our platform helps you work smarter, not harder.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Contact Section */}
//       <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
//         <div className="text-center">
//           <h2 className="text-4xl font-bold text-gray-900 mb-6">Get in Touch</h2>
//           <p className="text-lg text-gray-600 mb-8">
//             Have questions? We'd love to hear from you.
//           </p>
//           <a
//             href="mailto:contact@documind.ai"
//             className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg"
//           >
//             Contact Us
//           </a>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-gray-800 text-white py-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <p>&copy; 2025 DocuMind AI. All rights reserved.</p>
//         </div>
//       </footer>
//     </div>
//   );
// }

import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Turn Documents & Instructions <br />
            <span className="text-blue-400">Into Actionable Work</span>
          </h1>

          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-10">
            DocuMind AI helps organizations assign documents or plain text
            instructions, automatically analyze them with AI, and track
            decisions securely across teams.
          </p>

          <div className="flex justify-center gap-4">
           
          </div>
        </div>
      </section>

      {/* TRUST / VALUE STRIP */}
      <section className="bg-slate-900 py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-2xl font-bold text-white">📄 Files & Text</h3>
            <p className="text-gray-300 mt-2">
              Assign PDFs, images, or simple instructions
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">🧠 AI Analysis</h3>
            <p className="text-gray-300 mt-2">
              Summaries, urgency & smart insights
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">🏢 Teams & Roles</h3>
            <p className="text-gray-300 mt-2">
              Departments, employees, permissions
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">🔐 Secure by Design</h3>
            <p className="text-gray-300 mt-2">
              Company-isolated, session-based auth
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Everything You Need to Manage Work Intelligently
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature Card */}
            <div className="bg-slate-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition">
              <div className="text-blue-400 text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-3 text-blue-400">
                AI-Powered Understanding
              </h3>
              <p className="text-gray-300">
                Automatically analyze documents or instructions using Google
                Gemini to extract summaries, intent, and urgency.
              </p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition">
              <div className="text-green-400 text-4xl mb-4">📨</div>
              <h3 className="text-xl font-semibold mb-3 text-green-400">
                Smart Assignment & Routing
              </h3>
              <p className="text-gray-300">
                Instantly route work to the right department or employee with
                full visibility and control.
              </p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition">
              <div className="text-purple-400 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3 text-purple-400">
                Decision Tracking
              </h3>
              <p className="text-gray-300">
                Track document status from pending to approved or rejected —
                with accountability at every step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="bg-gray-900 py-24 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Built for Real Organizations
          </h2>
          <p className="text-lg text-gray-300 mb-4">
            DocuMind AI is designed for companies drowning in documents,
            instructions, and manual workflows.
          </p>
          <p className="text-lg text-gray-300">
            We transform scattered information into structured, actionable work
            — securely, intelligently, and at scale.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-blue-600 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">
          Bring Clarity to Your Organization
        </h2>
        <p className="text-xl mb-8">
          Start assigning work intelligently — not manually.
        </p>
        
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-gray-400 py-8 text-center">
        <p>&copy; 2025 DocuMind AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
