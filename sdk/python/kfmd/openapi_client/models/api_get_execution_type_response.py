# coding: utf-8

"""
    api/service.proto

    No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)  # noqa: E501

    The version of the OpenAPI document: version not set
    Generated by: https://openapi-generator.tech
"""


import pprint
import re  # noqa: F401

import six


class ApiGetExecutionTypeResponse(object):
    """NOTE: This class is auto generated by OpenAPI Generator.
    Ref: https://openapi-generator.tech

    Do not edit the class manually.
    """

    """
    Attributes:
      openapi_types (dict): The key is attribute name
                            and the value is attribute type.
      attribute_map (dict): The key is attribute name
                            and the value is json key in definition.
    """
    openapi_types = {
        'execution_type': 'MlMetadataExecutionType'
    }

    attribute_map = {
        'execution_type': 'execution_type'
    }

    def __init__(self, execution_type=None):  # noqa: E501
        """ApiGetExecutionTypeResponse - a model defined in OpenAPI"""  # noqa: E501

        self._execution_type = None
        self.discriminator = None

        if execution_type is not None:
            self.execution_type = execution_type

    @property
    def execution_type(self):
        """Gets the execution_type of this ApiGetExecutionTypeResponse.  # noqa: E501


        :return: The execution_type of this ApiGetExecutionTypeResponse.  # noqa: E501
        :rtype: MlMetadataExecutionType
        """
        return self._execution_type

    @execution_type.setter
    def execution_type(self, execution_type):
        """Sets the execution_type of this ApiGetExecutionTypeResponse.


        :param execution_type: The execution_type of this ApiGetExecutionTypeResponse.  # noqa: E501
        :type: MlMetadataExecutionType
        """

        self._execution_type = execution_type

    def to_dict(self):
        """Returns the model properties as a dict"""
        result = {}

        for attr, _ in six.iteritems(self.openapi_types):
            value = getattr(self, attr)
            if isinstance(value, list):
                result[attr] = list(map(
                    lambda x: x.to_dict() if hasattr(x, "to_dict") else x,
                    value
                ))
            elif hasattr(value, "to_dict"):
                result[attr] = value.to_dict()
            elif isinstance(value, dict):
                result[attr] = dict(map(
                    lambda item: (item[0], item[1].to_dict())
                    if hasattr(item[1], "to_dict") else item,
                    value.items()
                ))
            else:
                result[attr] = value

        return result

    def to_str(self):
        """Returns the string representation of the model"""
        return pprint.pformat(self.to_dict())

    def __repr__(self):
        """For `print` and `pprint`"""
        return self.to_str()

    def __eq__(self, other):
        """Returns true if both objects are equal"""
        if not isinstance(other, ApiGetExecutionTypeResponse):
            return False

        return self.__dict__ == other.__dict__

    def __ne__(self, other):
        """Returns true if both objects are not equal"""
        return not self == other
