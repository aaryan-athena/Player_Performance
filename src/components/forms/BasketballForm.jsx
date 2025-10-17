import React, { useState } from 'react';

/**
 * Basketball match data entry form
 * Handles basketball-specific performance parameters
 */
function BasketballForm({ onSubmit, loading = false, disabled = false }) {
  const [formData, setFormData] = useState({
    pointsScored: '',
    rebounds: '',
    assists: '',
    steals: '',
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
    const points = Number(formData.pointsScored);
    const rebounds = Number(formData.rebounds);
    const assists = Number(formData.assists);
    const steals = Number(formData.steals);
    const minutes = Number(formData.minutesPlayed);

    // Basic required field validation
    if (formData.pointsScored === '') {
      newErrors.pointsScored = 'Points scored is required';
    } else if (points < 0 || points > 100) {
      newErrors.pointsScored = 'Points must be between 0 and 100';
    }

    if (formData.rebounds === '') {
      newErrors.rebounds = 'Rebounds is required';
    } else if (rebounds < 0 || rebounds > 50) {
      newErrors.rebounds = 'Rebounds must be between 0 and 50';
    }

    if (formData.assists === '') {
      newErrors.assists = 'Assists is required';
    } else if (assists < 0 || assists > 30) {
      newErrors.assists = 'Assists must be between 0 and 30';
    }

    if (formData.steals === '') {
      newErrors.steals = 'Steals is required';
    } else if (steals < 0 || steals > 20) {
      newErrors.steals = 'Steals must be between 0 and 20';
    }

    if (formData.minutesPlayed === '') {
      newErrors.minutesPlayed = 'Minutes played is required';
    } else if (minutes < 0 || minutes > 60) {
      newErrors.minutesPlayed = 'Minutes played must be between 0 and 60';
    }

    // Logical validations
    if (minutes === 0 && (points > 0 || rebounds > 0 || assists > 0 || steals > 0)) {
      newErrors.minutesPlayed = 'Cannot have performance stats without playing time';
    }

    if (points > minutes * 3) {
      newErrors.pointsScored = 'Points per minute seems unusually high';
    }

    if (assists > minutes / 2) {
      newErrors.assists = 'Assists per minute seems unusually high';
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
      pointsScored: Number(formData.pointsScored),
      rebounds: Number(formData.rebounds),
      assists: Number(formData.assists),
      steals: Number(formData.steals),
      minutesPlayed: Number(formData.minutesPlayed)
    };

    onSubmit(matchParameters);
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      pointsScored: '',
      rebounds: '',
      assists: '',
      steals: '',
      minutesPlayed: ''
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Points Scored */}
        <div>
          <label htmlFor="pointsScored" className="block text-sm font-medium text-gray-700">
            Points Scored *
          </label>
          <input
            type="number"
            id="pointsScored"
            name="pointsScored"
            value={formData.pointsScored}
            onChange={handleInputChange}
            min="0"
            max="100"
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.pointsScored ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 24"
          />
          {errors.pointsScored && (
            <p className="mt-1 text-sm text-red-600">{errors.pointsScored}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Total points scored in the game</p>
        </div>

        {/* Rebounds */}
        <div>
          <label htmlFor="rebounds" className="block text-sm font-medium text-gray-700">
            Rebounds *
          </label>
          <input
            type="number"
            id="rebounds"
            name="rebounds"
            value={formData.rebounds}
            onChange={handleInputChange}
            min="0"
            max="50"
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.rebounds ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 8"
          />
          {errors.rebounds && (
            <p className="mt-1 text-sm text-red-600">{errors.rebounds}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Total rebounds (offensive + defensive)</p>
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
            max="30"
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.assists ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 6"
          />
          {errors.assists && (
            <p className="mt-1 text-sm text-red-600">{errors.assists}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Number of assists provided</p>
        </div>

        {/* Steals */}
        <div>
          <label htmlFor="steals" className="block text-sm font-medium text-gray-700">
            Steals *
          </label>
          <input
            type="number"
            id="steals"
            name="steals"
            value={formData.steals}
            onChange={handleInputChange}
            min="0"
            max="20"
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.steals ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 3"
          />
          {errors.steals && (
            <p className="mt-1 text-sm text-red-600">{errors.steals}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Number of steals made</p>
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
            max="60"
            disabled={disabled}
            className={`mt-1 block w-full md:w-1/2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.minutesPlayed ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            placeholder="e.g., 32"
          />
          {errors.minutesPlayed && (
            <p className="mt-1 text-sm text-red-600">{errors.minutesPlayed}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Total minutes played in the game (including overtime)
          </p>
        </div>
      </div>

      {/* Performance Preview */}
      {formData.minutesPlayed > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-orange-900 mb-2">Performance Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-orange-700">Points/Min:</span>
              <span className="ml-1 font-medium">
                {(Number(formData.pointsScored) / Number(formData.minutesPlayed)).toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-orange-700">Rebounds/Min:</span>
              <span className="ml-1 font-medium">
                {(Number(formData.rebounds) / Number(formData.minutesPlayed)).toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-orange-700">Assists/Min:</span>
              <span className="ml-1 font-medium">
                {(Number(formData.assists) / Number(formData.minutesPlayed)).toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-orange-700">Steals/Min:</span>
              <span className="ml-1 font-medium">
                {(Number(formData.steals) / Number(formData.minutesPlayed)).toFixed(1)}
              </span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-orange-700">Efficiency Rating:</span>
              <span className="ml-1 font-medium">
                {(
                  (Number(formData.pointsScored) + Number(formData.rebounds) + Number(formData.assists) + Number(formData.steals)) / 
                  Number(formData.minutesPlayed)
                ).toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-orange-700">Total Stats:</span>
              <span className="ml-1 font-medium">
                {Number(formData.pointsScored) + Number(formData.rebounds) + Number(formData.assists) + Number(formData.steals)} combined
              </span>
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
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center"
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

export default BasketballForm;