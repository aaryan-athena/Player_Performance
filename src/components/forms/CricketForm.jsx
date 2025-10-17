import React, { useState } from 'react';

/**
 * Cricket match data entry form
 * Handles cricket-specific performance parameters
 */
function CricketForm({ onSubmit, loading = false, disabled = false }) {
  const [formData, setFormData] = useState({
    runsScored: '',
    ballsFaced: '',
    wicketsTaken: '',
    catches: '',
    oversBowled: ''
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
    const runs = Number(formData.runsScored);
    const balls = Number(formData.ballsFaced);
    const wickets = Number(formData.wicketsTaken);
    const catches = Number(formData.catches);
    const overs = Number(formData.oversBowled);

    // Basic required field validation
    if (formData.runsScored === '') {
      newErrors.runsScored = 'Runs scored is required';
    } else if (runs < 0 || runs > 500) {
      newErrors.runsScored = 'Runs must be between 0 and 500';
    }

    if (formData.ballsFaced === '') {
      newErrors.ballsFaced = 'Balls faced is required';
    } else if (balls < 0 || balls > 600) {
      newErrors.ballsFaced = 'Balls faced must be between 0 and 600';
    }

    if (formData.wicketsTaken === '') {
      newErrors.wicketsTaken = 'Wickets taken is required';
    } else if (wickets < 0 || wickets > 10) {
      newErrors.wicketsTaken = 'Wickets must be between 0 and 10';
    }

    if (formData.catches === '') {
      newErrors.catches = 'Catches is required';
    } else if (catches < 0 || catches > 20) {
      newErrors.catches = 'Catches must be between 0 and 20';
    }

    if (formData.oversBowled === '') {
      newErrors.oversBowled = 'Overs bowled is required';
    } else if (overs < 0 || overs > 50) {
      newErrors.oversBowled = 'Overs bowled must be between 0 and 50';
    }

    // Logical validations
    if (runs > 0 && balls === 0) {
      newErrors.ballsFaced = 'Cannot score runs without facing balls';
    }

    if (runs > balls * 6) {
      newErrors.runsScored = 'Runs cannot exceed 6 times balls faced';
    }

    if (wickets > 0 && overs === 0) {
      newErrors.oversBowled = 'Cannot take wickets without bowling overs';
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
      runsScored: Number(formData.runsScored),
      ballsFaced: Number(formData.ballsFaced),
      wicketsTaken: Number(formData.wicketsTaken),
      catches: Number(formData.catches),
      oversBowled: Number(formData.oversBowled)
    };

    onSubmit(matchParameters);
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      runsScored: '',
      ballsFaced: '',
      wicketsTaken: '',
      catches: '',
      oversBowled: ''
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Runs Scored */}
        <div>
          <label htmlFor="runsScored" className="block text-sm font-medium text-gray-700">
            Runs Scored *
          </label>
          <input
            type="number"
            id="runsScored"
            name="runsScored"
            value={formData.runsScored}
            onChange={handleInputChange}
            min="0"
            max="500"
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.runsScored ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 45"
          />
          {errors.runsScored && (
            <p className="mt-1 text-sm text-red-600">{errors.runsScored}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Total runs scored in the match</p>
        </div>

        {/* Balls Faced */}
        <div>
          <label htmlFor="ballsFaced" className="block text-sm font-medium text-gray-700">
            Balls Faced *
          </label>
          <input
            type="number"
            id="ballsFaced"
            name="ballsFaced"
            value={formData.ballsFaced}
            onChange={handleInputChange}
            min="0"
            max="600"
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.ballsFaced ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 30"
          />
          {errors.ballsFaced && (
            <p className="mt-1 text-sm text-red-600">{errors.ballsFaced}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Number of balls faced while batting</p>
        </div>

        {/* Wickets Taken */}
        <div>
          <label htmlFor="wicketsTaken" className="block text-sm font-medium text-gray-700">
            Wickets Taken *
          </label>
          <input
            type="number"
            id="wicketsTaken"
            name="wicketsTaken"
            value={formData.wicketsTaken}
            onChange={handleInputChange}
            min="0"
            max="10"
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.wicketsTaken ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 2"
          />
          {errors.wicketsTaken && (
            <p className="mt-1 text-sm text-red-600">{errors.wicketsTaken}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Number of wickets taken while bowling</p>
        </div>

        {/* Catches */}
        <div>
          <label htmlFor="catches" className="block text-sm font-medium text-gray-700">
            Catches *
          </label>
          <input
            type="number"
            id="catches"
            name="catches"
            value={formData.catches}
            onChange={handleInputChange}
            min="0"
            max="20"
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.catches ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 1"
          />
          {errors.catches && (
            <p className="mt-1 text-sm text-red-600">{errors.catches}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Number of catches taken in the field</p>
        </div>

        {/* Overs Bowled */}
        <div className="md:col-span-2">
          <label htmlFor="oversBowled" className="block text-sm font-medium text-gray-700">
            Overs Bowled *
          </label>
          <input
            type="number"
            id="oversBowled"
            name="oversBowled"
            value={formData.oversBowled}
            onChange={handleInputChange}
            min="0"
            max="50"
            step="0.1"
            disabled={disabled}
            className={`mt-1 block w-full md:w-1/2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.oversBowled ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 4.2"
          />
          {errors.oversBowled && (
            <p className="mt-1 text-sm text-red-600">{errors.oversBowled}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Number of overs bowled (use decimals for partial overs, e.g., 4.2 for 4 overs and 2 balls)
          </p>
        </div>
      </div>

      {/* Performance Preview */}
      {formData.runsScored && formData.ballsFaced && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Performance Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Strike Rate:</span>
              <span className="ml-1 font-medium">
                {formData.ballsFaced > 0 ? 
                  ((Number(formData.runsScored) / Number(formData.ballsFaced)) * 100).toFixed(1) : 
                  '0'
                }
              </span>
            </div>
            {formData.oversBowled > 0 && (
              <div>
                <span className="text-blue-700">Economy Rate:</span>
                <span className="ml-1 font-medium">
                  {(Number(formData.runsScored) / Number(formData.oversBowled)).toFixed(1)}
                </span>
              </div>
            )}
            {formData.wicketsTaken > 0 && formData.oversBowled > 0 && (
              <div>
                <span className="text-blue-700">Bowling Avg:</span>
                <span className="ml-1 font-medium">
                  {(Number(formData.oversBowled) / Number(formData.wicketsTaken)).toFixed(1)} overs/wicket
                </span>
              </div>
            )}
            <div>
              <span className="text-blue-700">Fielding:</span>
              <span className="ml-1 font-medium">{formData.catches} catches</span>
            </div>
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center"
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

export default CricketForm;