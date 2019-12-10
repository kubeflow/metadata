# Copyright 2019 kubeflow.org.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from setuptools import setup, find_packages

NAME = 'kubeflow-metadata'
VERSION = '0.3.0'

REQUIRES = [
    'ml-metadata==0.15.0',
    'retrying'
]

setup(
    name=NAME,
    version=VERSION,
    description='KubeFlow Metadata SDK',
    long_description='Please visit the document page: https://kubeflow-metadata.readthedocs.io/en/latest/',
    author='Kubeflow Authors',
    license='Apache License Version 2.0',
    url='https://github.com/kubeflow/metadata',
    install_requires=REQUIRES,
    packages=find_packages(),
    classifiers=[
        'Intended Audience :: Developers',
        'Intended Audience :: Education',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: Apache Software License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Topic :: Scientific/Engineering',
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
        'Topic :: Software Development',
        'Topic :: Software Development :: Libraries',
        'Topic :: Software Development :: Libraries :: Python Modules',
    ],
    python_requires='>=3.5.3',
    include_package_data=True)
