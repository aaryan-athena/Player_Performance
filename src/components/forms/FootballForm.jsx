import React, { useState } from 'react';

/**
 * Football match data entry form
 * Handles football-specific performance parameters
 */
function FootballForm({ onSubmit, loading = false, disabled = false }) {
  const [formData, setFormData] = useState({
    goalsScored: '',
    assists: '',
    passesCompleted: '',
    tacklesMade: '',
    minutesPlayed: ''
  });

  const [errors, setErrors] = useState({});

  /**
   * Handle input changes
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow positive numbers
    if (value === '' || (Number(value) >= 0 && !isNaN(Number(value)))) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error for this field
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: null
        }));
      }
    }
  };

  /**
   * Validate form data
   * @returns {Object} Validation result with isValid and errors
   */
  const validateForm = () => {
    const newErrors = {};

    // Convert to numbers for validation
    const goals = Number(formData.goalsScored);
    const assists = Number(formData.assists);
    const passes = Number(formData.passesCompleted);
    const tackles = Number(formData.tacklesMade);
    const minutes = Number(formData.minutesPlayed);

    // Basic required field validation
    if (formData.goalsScored === '') {
      newErrors.goalsScored = 'Goals scored is required';
    } else if (goals < 0 || goals > 20) {
      newErrors.goalsScored = 'Goals must be between 0 and 20';
    }

    if (formData.assists === '') {
      newErrors.assists = 'Assists is required';
    } else if (assists < 0 || assists > 20) {
      newErrors.assists = 'Assists must be between 0 and 20';
    }

    if (formData.passesCompleted === '') {
      newErrors.passesCompleted = 'Passes completed is required';
    } else if (passes < 0 || passes > 200) {
      newErrors.passesCompleted = 'Passes completed must be between 0 and 200';
    }

    if (formData.tacklesMade === '') {
      newErrors.tacklesMade = 'Tackles made is required';
    } else if (tackles < 0 || tackles > 50) {
      newErrors.tacklesMade = 'Tackles must be between 0 and 50';
    }

    if (formData.minutesPlayed === '') {
      newErrors.minutesPlayed = 'Minutes played is required';
    } else if (minutes < 0 || minutes > 120) {
      newErrors.minutesPlayed = 'Minutes played must be between 0 and 120';
    }

    // Logical validations
    if (minutes === 0 && (goals > 0 || assists > 0 || passes > 0 || tackles > 0)) {
      newErrors.minutesPlayed = 'Cannot have performance stats without playing time';
    }

    if (goals + assists > 15) {
      newErrors.goalsScored = 'Combined goals and assists seems unusually high';
      newErrors.assists = 'Combined goals and assists seems unusually high';
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) {
      return;
    }

    // Convert form data to numbers
    const matchParameters = {
      goalsScored: Number(formData.goalsScored),
      assists: Number(formData.assists),
      passesCompleted: Number(formData.passesCompleted),
      tacklesMade: Number(formData.tacklesMade),
      minutesPlayed: Number(formData.minutesPlayed)
    };

    onSubmit(matchParameters);
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      goalsScored: '',
      assists: '',
      passesCompleted: '',
      tacklesMade: '',
      minutesPlayed: ''
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goals Scored */}
        <div>
          <label htmlFor="goalsScored" className="block text-sm font-medium text-gray-700">
            Goals Scored *
          </label>
          <input
            type="number"
            id="goalsScored"
            name="goalsScored"
            value={formData.goalsScored}
            onChange={handleInputChange}
            min="0"
            max="20"
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.goalsScored ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 2"
          />
          {errors.goalsScored && (
            <p className="mt-1 text-sm text-red-600">{errors.goalsScored}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Number of goals scored in the match</p>
        </div>

        {/* Assists */}
        <div>
          <label htmlFor="assists" className="block text-sm font-medium text-gray-700">
            Assists *
          </label>
          <input
            type="number"
            id="assists"
            name="assists"
            value={formData.assists}
            onChange={handleInputChange}
            min="0"
            max="20"
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.assists ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 1"
          />
          {errors.assists && (
            <p className="mt-1 text-sm text-red-600">{errors.assists}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Number of assists provided</p>
        </div>

        {/* Passes Completed */}
        <div>
          <label htmlFor="passesCompleted" className="block text-sm font-medium text-gray-700">
            Passes Completed *
          </label>
          <input
            type="number"
            id="passesCompleted"
            name="passesCompleted"
            value={formData.passesCompleted}
            onChange={handleInputChange}
            min="0"
            max="200"
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.passesCompleted ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 45"
          />
          {errors.passesCompleted && (
            <p className="mt-1 text-sm text-red-600">{errors.passesCompleted}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Number of successful passes completed</p>
        </div>

        {/* Tackles Made */}
        <div>
          <label htmlFor="tacklesMade" className="block text-sm font-medium text-gray-700">
            Tackles Made *
          </label>
          <input
            type="number"
            id="tacklesMade"
            name="tacklesMade"
            value={formData.tacklesMade}
            onChange={handleInputChange}
            min="0"
            max="50"
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.tacklesMade ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 8"
          />
          {errors.tacklesMade && (
            <p className="mt-1 text-sm text-red-600">{errors.tacklesMade}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Number of successful tackles made</p>
        </div>

        {/* Minutes Played */}
        <div className="md:col-span-2">
          <label htmlFor="minutesPlayed" className="block text-sm font-medium text-gray-700">
            Minutes Played *
          </label>
          <input
            type="number"
            id="minutesPlayed"
            name="minutesPlayed"
            value={formData.minutesPlayed}
            onChange={handleInputChange}
            min="0"
            max="120"
            disabled={disabled}
            className={`mt-1 block w-full md:w-1/2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.minutesPlayed ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 90"
          />
          {errors.minutesPlayed && (
            <p className="mt-1 text-sm text-red-600">{errors.minutesPlayed}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Total minutes played in the match (including extra time)
          </p>
        </div>
      </div>

      {/* Performance Preview */}
      {formData.minutesPlayed > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">Performance Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-green-700">Goals/90min:</span>
              <span className="ml-1 font-medium">
                {((Number(formData.goalsScored) / Number(formData.minutesPlayed)) * 90).toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-green-700">Assists/90min:</span>
              <span className="ml-1 font-medium">
                {((Number(formData.assists) / Number(formData.minutesPlayed)) * 90).toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-green-700">Pass Rate:</span>
              <span className="ml-1 font-medium">
                {(Number(formData.passesCompleted) / Number(formData.minutesPlayed)).toFixed(1)}/min
              </span>
            </div>
            <div>
              <span className="text-green-700">Tackles/90min:</span>
              <span className="ml-1 font-medium">
                {((Number(formData.tacklesMade) / Number(formData.minutesPlayed)) * 90).toFixed(1)}
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-green-700">Goal Contributions:</span>
            <span className="ml-1 font-medium">
              {Number(formData.goalsScored) + Number(formData.assists)} 
              (Goals: {formData.goalsScored}, Assists: {formData.assists})
            </span>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={resetForm}
          disabled={disabled}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
        >
          Reset Form
        </button>
        <button
          type="submit"
          disabled={disabled || loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center"
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? 'Submitting...' : 'Submit Match Data'}
        </button>
      </div>
    </form>
  );
}

export default FootballForm;