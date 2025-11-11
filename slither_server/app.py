from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import subprocess
import os

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    code = data.get('code', '')
    if not code:
        return jsonify({'error': 'Missing Solidity code'}), 400

    # Save Solidity code to a temporary file
    with tempfile.TemporaryDirectory() as tmpdir:
        solidity_file = os.path.join(tmpdir, 'TestContract.sol')
        with open(solidity_file, 'w') as f:
            f.write(code)

        # Run Slither analysis
        try:
            result = subprocess.run(
                [
                    'slither',
                    solidity_file,
                    '--json', '-'
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=60
            )
            output = result.stdout.decode()
            errors = result.stderr.decode()
            return jsonify({
                'success': True,
                'slither_output': output,
                'slither_errors': errors
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)




