# Goal Tracker - Advanced Goal Tracking & Analytics Platform

A comprehensive goal tracking application built with Next.js, featuring smart analytics, task scheduling, and productivity insights.

## Features

### 🎯 Goal Management
- **Goal Sets**: Organize your objectives into themed collections
- **Color-coded Organization**: Visual categorization with custom color themes
- **Priority Levels**: High, medium, and low priority classification
- **Progress Tracking**: Real-time completion rates and visual progress bars

### ✅ Task Management
- **Smart Scheduling**: Date and time-based task scheduling
- **Recurring Tasks**: Daily, weekly, and monthly recurrence patterns
- **Priority Management**: Task prioritization with visual indicators
- **Time Tracking**: Estimated vs actual duration tracking
- **Tagging System**: Flexible task categorization with custom tags

### 📊 Analytics & Insights
- **Productivity Score**: AI-calculated productivity metrics (0-100)
- **Streak Tracking**: Daily completion streak monitoring
- **Weekly Progress**: Visual charts showing 7-day completion trends
- **Goal Set Analytics**: Individual goal set performance metrics
- **Completion Rates**: Overall and goal-specific completion statistics

### 🤖 Smart Features
- **AI Suggestions**: Intelligent recommendations for task scheduling and productivity
- **Auto-scheduling**: Automatic task distribution across available time slots
- **Productivity Insights**: Pattern recognition and improvement suggestions
- **Overdue Detection**: Automatic identification of overdue tasks

### 💾 Data Management
- **Export Options**: JSON and CSV export formats
- **Import Functionality**: Restore data from JSON backups
- **Local Storage**: Client-side data persistence
- **Data Portability**: Easy migration between devices

### ⚙️ Customization
- **Dark Theme**: Modern dark-first design
- **Compact Mode**: Space-efficient layout option
- **User Preferences**: Customizable default views and settings
- **Responsive Design**: Optimized for desktop, tablet, and mobile

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **UI Components**: shadcn/ui with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono
- **Storage**: Browser localStorage with error handling
- **Analytics**: Vercel Analytics integration

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   \`\`\`bash
   # If using GitHub integration
   git clone <your-repo-url>
   cd goal-tracker
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Deployment

#### Vercel (Recommended)
1. Click the "Publish" button in the v0 interface
2. Connect your GitHub account if prompted
3. Your app will be automatically deployed to Vercel

#### Manual Deployment
1. Build the application:
   \`\`\`bash
   npm run build
   \`\`\`
2. Deploy the `out` folder to your hosting provider

## Usage Guide

### Getting Started
1. **Create Account**: Enter your name and email on the welcome screen
2. **Create Goal Set**: Start by creating your first goal set (e.g., "Health & Fitness")
3. **Add Tasks**: Create specific, actionable tasks within your goal sets
4. **Schedule Tasks**: Set dates, times, and recurrence patterns
5. **Track Progress**: Mark tasks complete and monitor your analytics

### Best Practices
- **Specific Goals**: Create clear, measurable goal sets
- **Regular Tasks**: Use recurring tasks for habits and routines
- **Priority Management**: Use priority levels to focus on important tasks
- **Time Estimation**: Add duration estimates to improve time management
- **Regular Review**: Check analytics weekly to identify patterns

### Data Management
- **Backup Regularly**: Export your data as JSON for safekeeping
- **Import Data**: Restore from backups when switching devices
- **CSV Export**: Export tasks to spreadsheets for external analysis

## Architecture

### Component Structure
\`\`\`
components/
├── ui/                 # shadcn/ui base components
├── analytics-charts.tsx    # Data visualization components
├── dashboard.tsx          # Main application interface
├── goal-set-*.tsx        # Goal set management components
├── task-*.tsx           # Task management components
├── settings-dialog.tsx   # User preferences and data management
└── smart-suggestions.tsx # AI-powered recommendations
\`\`\`

### Data Flow
1. **Local Storage**: All data persisted in browser localStorage
2. **React Context**: User authentication and global state management
3. **Custom Hooks**: Business logic for goals, tasks, and analytics
4. **Real-time Updates**: Immediate UI updates with optimistic rendering

### Performance Optimizations
- **Error Boundaries**: Graceful error handling and recovery
- **Loading States**: Smooth user experience during data operations
- **Debounced Inputs**: Optimized form interactions
- **Memoized Calculations**: Efficient analytics computations

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Privacy & Security

- **Local Data**: All data stored locally in your browser
- **No Server**: No personal data transmitted to external servers
- **Export Control**: Full control over your data with export/import features

## Contributing

This project was generated with v0.app. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
1. Check the in-app help and tooltips
2. Review this documentation
3. Open an issue on GitHub
4. Contact support through Vercel

---

**Built with ❤️ using v0.app**
\`\`\`

```json file="" isHidden
