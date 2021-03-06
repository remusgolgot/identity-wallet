/**
 * Created by vladtomsa on 10/10/2018
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withStyles} from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Check from 'mdi-material-ui/AccountCheck';
import Edit from 'mdi-material-ui/Pencil';
import Eye from 'mdi-material-ui/Eye';
import EyeOff from 'mdi-material-ui/EyeOff';
import FileDownload from 'mdi-material-ui/CloudDownload';
import {getFileAttribute, deselectFileAttribute} from 'actions/attributes';
import {onNotificationErrorInit} from 'actions/notifications';
import {attributesConstants} from 'constants/attributes';
import {decryptValue} from 'helpers/personaService';
import FilePreview from './FilePreview';
import PassphrasePromt from './PassphrasePromtForm';

const PLAIN_DATA_TYPES = ['file'];

const styles = (theme) => {
  return {
    valueContainer: {
      '& button': {
        letterSpacing: '1px !important',
        marginTop: 6,
        '& *': {
          color: theme.palette.text.secondary,
        },
      },
    },
    editButton: {
      '& *': {
        color: `${theme.palette.primary.main} !important`
      },
    },
  };
};

const initialState = {
  isDialogOpen: null,
  toDecrypt: null,
  decryptedValue: null,
};

class Index extends Component {
  state = initialState;

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.attribute !== this.props.attribute) {
      this.setState({...initialState});
    }
  }

  decyptValue = (passphrase) => {
    try {
      const {toDecrypt} = this.state;
      const decryptedValue = decryptValue(toDecrypt, passphrase);

      this.toggleDecryptedValue(decryptedValue)
    }
    catch (e) {
      this.props.onNotificationErrorInit('FAILED_TO_DECRYPT_VALUE');
    }
  };

  toggleOpenDialog = (value) => {
    this.setState({isDialogOpen: value})
  };

  toggleValueView = () => {
    const {decryptedValue} = this.state;
    const {passphrase} = this.props;

    if (!!decryptedValue) {
      this.toggleDecryptedValue(null);
    }
    else {
      // if we allready saved the passphrase on the store
      if (passphrase) {
        this.decyptValue(passphrase);
      }
      else {
        this.toggleOpenDialog(true)
      }
    }
  };

  toggleDecryptedValue = (value) => {
    this.setState({decryptedValue: value, isDialogOpen: null, toDecrypt: null})
  };

  toggleDownloadFileAttribute = () => {
    const {attribute: {value}, getFileAttribute} = this.props;

    getFileAttribute(value)
      .then((fileData) => {
        if (fileData) {
          this.setState(
            {toDecrypt: fileData},
            () => this.toggleValueView(),
          );
        }
      });
  };

  getFileValueForEdit = (attribute, value) => {
    const {name} = attribute;
    const fileInfo = value.split(';');
    const fileType = fileInfo[0];

    return [
      {
        fileData: value,
        fileName: name,
        fileType,
      }
    ];
  };

  render() {
    const {attribute, classes, deselectFileAttribute, isLoading, onEdit, onAttributeValidateRequest, t} = this.props;
    const {decryptedValue, isDialogOpen} = this.state;
    const {value, data_type} = attribute;

    if (!value) return null;

    const isPlainTextAttributeOnBlockchain = !!PLAIN_DATA_TYPES.find((type) => type === data_type);

    const isFile = data_type === 'file';

    const isFileDownloading = isLoading === attributesConstants.ON_GET_FILE_ATTRIBUTE_INIT;

    const toggleShowHide = () => {
      this.setState(
        {toDecrypt: value},
        () => this.toggleValueView(),
      )
    };

    const showFilePreview = isFile && decryptedValue;

    const isValidationDisabled = (
      attribute.options
      && attribute.userAttribute
      && attribute.options.documentRequired
      && !attribute.userAttribute.attributeAssociations.length
    ) || (
      attribute.userAttribute
      && attribute.userAttribute.rejected
    );

    const DecryptTooltip = () => (
      <div>
        <p>{t('YOUR_THE_OWNER')}</p>
        <p>{t('IN_ORDER_TO_VIEW_INFORMATION_PLEASE_DECRYPT')}</p>
      </div>
    );

    return (
      <div className={`${classes.valueContainer}`}>
        {
          decryptedValue && !isFile && (
            <div>
              <Typography
                component="p"
                variant="h4"
                style={{wordBreak: 'break-all', padding: '2px 0', marginBottom: 14,}}
              >
                {decryptedValue}
              </Typography>
            </div>
          )
        }

        {
          !isPlainTextAttributeOnBlockchain
            ? (
              <div>
                {
                  decryptedValue
                    ? (
                      <div className="flex wrap-content">
                        <Button
                          size="small"
                          color="inherit"
                          variant="outlined"
                          onClick={toggleShowHide}
                          style={{marginBottom: 6}}
                        >
                          <EyeOff/>&nbsp;&nbsp;{t('HIDE_VALUE')}
                        </Button>
                        &nbsp;&nbsp;
                        <Button
                          size="small"
                          color="primary"
                          variant="outlined"
                          onClick={
                            () => {
                              onEdit({...attribute, value: decryptedValue})
                              toggleShowHide();
                            }
                          }
                          style={{marginBottom: 6}}
                          className={classes.editButton}
                        >
                          <Edit/>&nbsp;&nbsp;{t('EDIT')}&nbsp;
                        </Button>

                      </div>
                    )
                    : (
                      <div className="flex wrap-content">
                        <Tooltip title={<DecryptTooltip/>}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            onClick={toggleShowHide}
                          >
                            <Eye/>&nbsp;&nbsp;{t('SHOW_VALUE')}
                          </Button>
                        </Tooltip>
                        &nbsp;&nbsp;
                        <Tooltip title={
                          isValidationDisabled
                            ? (
                              attribute.userAttribute && attribute.userAttribute.rejected
                                ? t('ATTRIBUTE_IS_REJECTED')
                                : t('ATTRIBUTE_ASSOCIATIONS_REQUIRED')
                            )
                            : ''
                        }>
                          <div>
                            <Button
                              onClick={() => onAttributeValidateRequest(attribute)}
                              variant="outlined"
                              color="primary"
                              className={isValidationDisabled ? '' : classes.editButton}
                              disabled={isValidationDisabled}
                            >
                              <Check/>&nbsp;&nbsp;{t('VALIDATE_ATTRIBUTE')}
                            </Button>
                          </div>
                        </Tooltip>
                      </div>
                    )
                }
              </div>
            )
            : null
        }

        {
          isFile
            ? (
              <div className="flex wrap-content">
                <Button
                  onClick={this.toggleDownloadFileAttribute}
                  disabled={!!isFileDownloading}
                  variant="outlined"
                  color="inherit"
                  size="small"
                >
                  {
                    isFileDownloading
                      ? <CircularProgress color="secondary" size={20}/>
                      : <FileDownload/>
                  }
                  &nbsp;&nbsp;
                  {t('DOWNLOAD_AND_PREVIEW')}
                </Button>
                &nbsp;&nbsp;
                <Tooltip title={
                  isValidationDisabled ? t('ATTRIBUTE_ASSOCIATIONS_REQUIRED') : ''
                }>
                  <div>
                    <Button
                      onClick={() => onAttributeValidateRequest(attribute)}
                      variant="outlined"
                      color="primary"
                      className={isValidationDisabled ? '' : classes.editButton}
                      disabled={isValidationDisabled}
                    >
                      <Check/>&nbsp;&nbsp;{t('VALIDATE_ATTRIBUTE')}
                    </Button>
                  </div>
                </Tooltip>
              </div>
            )
            : null
        }

        {
          isDialogOpen
            ? (
              <PassphrasePromt
                onSubmit={({passphrase}) => this.decyptValue(passphrase)}
                onClose={() => this.toggleOpenDialog(null)}
                t={t}
              />
            )
            : null
        }

        {
          showFilePreview
            ? (
              <FilePreview
                fileData={decryptedValue}
                onClose={() => {
                  this.toggleDecryptedValue(null);
                  deselectFileAttribute();
                }}
                onEdit={() => {
                  onEdit({...attribute, value: this.getFileValueForEdit(attribute, decryptedValue)});
                  toggleShowHide();
                }}
                t={t}
              />
            )
            : null
        }
      </div>
    );
  }
}

Index.propTypes = {
  attribute: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  passphrase: PropTypes.any,
  onEdit: PropTypes.any,
  onAttributeValidateRequest: PropTypes.any,
  t: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    isLoading: state.attributes.isLoading,
    passphrase: state.global.passphrase,
    selectedFileAttribute: state.attributes.selectedFileAttribute,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    getFileAttribute: (hash, passphrase) => dispatch(getFileAttribute(hash, passphrase)),
    deselectFileAttribute: () => dispatch(deselectFileAttribute()),
    onNotificationErrorInit: (message) => dispatch(onNotificationErrorInit(message)),
  };
};

const withConnect = connect(mapStateToProps, mapDispatchToProps)(Index);

export default withStyles(styles)(withConnect);
