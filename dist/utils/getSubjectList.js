"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubjectList = void 0;
const getSubjectList = (exam) => {
    switch (exam.toLowerCase()) {
        case "jee":
            return ["maths", "physics", "chemistry"].map(subject => ({
                name: subject,
                overall_efficiency: 0,
                overall_progress: 0,
                total_questions_solved: {
                    number: 0,
                    percentage: 0
                }
            }));
        case "neet":
            return ["biology", "physics", "chemistry"].map(subject => ({
                name: subject,
                overall_efficiency: 0,
                overall_progress: 0,
                total_questions_solved: {
                    number: 0,
                    percentage: 0
                }
            }));
        default:
            return [];
    }
};
exports.getSubjectList = getSubjectList;
